import { Request, Response, NextFunction } from "express";
import { prisma } from "../client";
import Groq from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Extend Express Request to include user
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    username?: string;
    email?: string;
  };
}

// Enhanced prompts for course generation (from Edulume)
const COURSE_OUTLINE_PROMPT = (topic: string) => `
Create a comprehensive course outline for "${topic}". This should be a well-structured, progressive learning path that takes students from basic concepts to advanced applications.

Respond with a JSON object ONLY. DO NOT include any other text, explanations, or introductions. Follow this exact structure:

{
  "title": "Course title that clearly describes what students will learn",
  "description": "A comprehensive 2-3 sentence description explaining what this course covers, who it's for, and what students will achieve by the end",
  "chapters": [
    {
      "title": "Chapter title that clearly indicates the learning objective",
      "description": "Brief 1-2 sentence description of what will be covered in this chapter and why it's important",
      "order_index": chapter number (starting from 1)
    }
  ]
}

Requirements for the course outline:
1. Create 8-12 chapters for comprehensive coverage
2. Structure should be logical and progressive (basic → intermediate → advanced)
3. Each chapter should build upon previous knowledge
4. Include both theoretical concepts and practical applications
5. Cover real-world use cases and examples
6. Include best practices and common pitfalls
7. End with advanced topics or specializations
8. Ensure the course is practical and applicable

Make sure the course is comprehensive, engaging, and provides real value to learners.
`;

const CHAPTER_CONTENT_PROMPT = (
  chapterTitle: string,
  courseTitle: string,
  chapterDescription: string
) => `
Generate comprehensive, educational content for the chapter "${chapterTitle}" which is part of the course "${courseTitle}".

Chapter Description: ${chapterDescription}

Create detailed, well-structured content that includes:

## Learning Objectives
- Clear, specific objectives for what students will learn
- Measurable outcomes they should achieve

## Core Concepts
- Detailed explanations of key concepts
- Clear definitions and terminology
- Why these concepts matter

## Detailed Content
- Step-by-step explanations
- Multiple examples and use cases
- Practical applications
- Code examples (if applicable)
- Diagrams or visual descriptions (describe what should be shown)

## Practical Examples
- Real-world scenarios
- Hands-on exercises or projects
- Common use cases and implementations

## Best Practices
- Industry standards and recommendations
- Common mistakes to avoid
- Tips for success

## Key Takeaways
- Summary of the most important points
- What students should remember
- How this connects to the next chapter

## Further Reading
- Suggested resources for deeper learning
- Related topics to explore

Format the content using proper Markdown:
- Use ## for main sections
- Use ### for subsections  
- Use bullet points for lists
- Use code blocks for examples (if applicable)
- Use **bold** and *italic* for emphasis
- Use > for important quotes or notes

The content should be:
- Comprehensive yet easy to understand
- Engaging and practical
- Well-organized with clear structure
- Suitable for learners at the appropriate level
- Rich with examples and real-world applications
- Professional and educational in tone

Aim for substantial content that provides real value and learning.
`;

// Optional auth middleware
const optionalAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      req.user = undefined;
      return next();
    }

    const token = authHeader.substring(7);
    if (!token) {
      req.user = undefined;
      return next();
    }

    const jwt = await import("jsonwebtoken");
    const decoded = jwt.default.verify(
      token,
      process.env.ACCESS_JWT_SECRET!
    ) as any;

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, username: true, email: true },
    });

    req.user = user || undefined;
    next();
  } catch (error) {
    req.user = undefined;
    next();
  }
};

// Get all courses with filters
export const getCourses = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<any> => {
  try {
    const {
      search,
      filter = "all",
      sort = "recent",
      page = 1,
      limit = 12,
    } = req.query;

    const userId = req.user?.id;
    let where: any = {};

    if (filter === "my-courses" && userId) {
      where.authorId = userId;
    } else if (filter === "bookmarked" && userId) {
      where.bookmarks = { some: { userId } };
    } else if (filter === "enrolled" && userId) {
      where.enrollments = { some: { userId } };
    } else {
      where.OR = [
        { isPublic: true },
        ...(userId ? [{ authorId: userId }] : []),
      ];
    }

    if (search) {
      const searchConditions = [
        { title: { contains: search as string, mode: "insensitive" } },
        { description: { contains: search as string, mode: "insensitive" } },
        { topic: { contains: search as string, mode: "insensitive" } },
      ];

      if (where.authorId || where.bookmarks || where.enrollments) {
        where.AND = [
          where.authorId
            ? { authorId: where.authorId }
            : where.bookmarks
            ? { bookmarks: where.bookmarks }
            : { enrollments: where.enrollments },
          { OR: searchConditions },
        ];
        delete where.authorId;
        delete where.bookmarks;
        delete where.enrollments;
      } else {
        where.AND = [
          { OR: where.OR || [{ isPublic: true }] },
          { OR: searchConditions },
        ];
        delete where.OR;
      }
    }

    let orderBy: any = {};
    switch (sort) {
      case "popular":
        orderBy = [{ views: "desc" }, { createdAt: "desc" }];
        break;
      case "oldest":
        orderBy = { createdAt: "asc" };
        break;
      default:
        orderBy = { createdAt: "desc" };
    }

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const take = parseInt(limit as string);

    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where,
        include: {
          chapters: { select: { id: true } },
          bookmarks: userId
            ? { where: { userId }, select: { id: true } }
            : { select: { id: true }, take: 0 },
          enrollments: userId
            ? { where: { userId }, select: { id: true } }
            : { select: { id: true }, take: 0 },
          _count: { select: { bookmarks: true, enrollments: true } },
        },
        orderBy,
        skip,
        take,
      }),
      prisma.course.count({ where }),
    ]);

    const transformedCourses = courses.map((course: any) => ({
      ...course,
      chapter_count: course.chapters.length,
      bookmark_count: course._count.bookmarks,
      enrollment_count: course._count.enrollments,
      is_bookmarked: userId ? course.bookmarks.length > 0 : false,
      is_enrolled: userId ? course.enrollments.length > 0 : false,
    }));

    res.json({
      courses: transformedCourses,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        pages: Math.ceil(total / parseInt(limit as string)),
      },
    });
  } catch (error) {
    console.error("Error fetching courses:", error);
    res.status(500).json({ error: "Failed to fetch courses" });
  }
};

// Get single course
export const getCourse = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<any> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        chapters: {
          orderBy: { orderIndex: "asc" },
          include: userId
            ? {
                progress: {
                  where: { userId },
                  select: { isCompleted: true, completedAt: true },
                },
              }
            : {},
        },
        bookmarks: userId
          ? { where: { userId }, select: { id: true } }
          : { select: { id: true }, take: 0 },
        enrollments: userId
          ? {
              where: { userId },
              select: {
                id: true,
                enrolledAt: true,
                isCompleted: true,
                completedAt: true,
                progressPercentage: true,
                lastAccessedAt: true,
              },
            }
          : { select: { id: true }, take: 0 },
        _count: { select: { bookmarks: true, enrollments: true } },
      },
    });

    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    if (!course.isPublic && course.authorId !== userId) {
      return res.status(403).json({ error: "Access denied" });
    }

    await prisma.course.update({
      where: { id },
      data: { views: { increment: 1 } },
    });

    if (userId && course.enrollments.length > 0) {
      await prisma.courseEnrollment.update({
        where: { courseId_userId: { courseId: id, userId } },
        data: { lastAccessedAt: new Date() },
      });
    }

    const transformedChapters = course.chapters?.map((chapter: any) => ({
      ...chapter,
      isCompleted:
        (chapter.progress && chapter.progress[0]?.isCompleted) || false,
      completedAt:
        (chapter.progress && chapter.progress[0]?.completedAt) || null,
    }));

    const courseDetails = {
      ...course,
      chapter_count: course.chapters.length,
      bookmark_count: course._count.bookmarks,
      enrollment_count: course._count.enrollments,
      is_bookmarked: userId ? course.bookmarks.length > 0 : false,
      is_enrolled: userId ? course.enrollments.length > 0 : false,
      enrollment_data:
        userId && course.enrollments.length > 0 ? course.enrollments[0] : null,
      chapters: transformedChapters,
    };

    res.json({ course: courseDetails });
  } catch (error) {
    console.error("Error fetching course:", error);
    res.status(500).json({ error: "Failed to fetch course" });
  }
};

// Generate course outline
export const generateOutline = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<any> => {
  try {
    console.log("🔍 Generate outline request received");
    console.log("User:", req.user);
    console.log("Headers:", req.headers.authorization);

    const { topic } = req.body;

    if (!topic) {
      return res.status(400).json({ error: "Topic is required" });
    }

    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: COURSE_OUTLINE_PROMPT(topic) }],
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 2000,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No content generated");
    }

    const outline = JSON.parse(content);
    res.json(outline);
  } catch (error: any) {
    console.error("Error generating course outline:", error);
    res.status(500).json({
      error: "Failed to generate course outline",
      details: error.message,
    });
  }
};

// Create course
export const createCourse = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<any> => {
  try {
    const { title, description, topic, chapters, isPublic = true } = req.body;

    if (
      !title ||
      !description ||
      !topic ||
      !chapters ||
      !Array.isArray(chapters)
    ) {
      return res.status(400).json({
        error: "Title, description, topic, and chapters are required",
      });
    }

    if (!req.user?.id) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const course = await prisma.course.create({
      data: {
        title,
        description,
        topic,
        authorId: req.user.id,
        isPublic,
        chapters: {
          create: chapters.map((chapter: any, index: number) => ({
            title: chapter.title,
            description: chapter.description,
            orderIndex: chapter.order_index || index + 1,
          })),
        },
      },
      include: { chapters: { orderBy: { orderIndex: "asc" } } },
    });

    res
      .status(201)
      .json({ id: course.id, message: "Course created successfully", course });
  } catch (error) {
    console.error("Error creating course:", error);
    res.status(500).json({ error: "Failed to create course" });
  }
};

// Generate chapter content
export const generateChapterContent = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<any> => {
  try {
    const { courseId, chapterId } = req.params;

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: { chapters: { where: { id: chapterId } } },
    });

    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    if (!req.user?.id || course.authorId !== req.user.id) {
      return res.status(403).json({ error: "Access denied" });
    }

    const chapter = course.chapters[0];
    if (!chapter) {
      return res.status(404).json({ error: "Chapter not found" });
    }

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: CHAPTER_CONTENT_PROMPT(
            chapter.title,
            course.title,
            chapter.description
          ),
        },
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 32768,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No content generated");
    }

    const updatedChapter = await prisma.courseChapter.update({
      where: { id: chapterId },
      data: { content },
    });

    res.json({
      message: "Chapter content generated successfully",
      content,
      chapter: updatedChapter,
    });
  } catch (error: any) {
    console.error("Error generating chapter content:", error);
    res.status(500).json({
      error: "Failed to generate chapter content",
      details: error.message,
    });
  }
};

// Toggle bookmark
export const toggleBookmark = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<any> => {
  try {
    const { id } = req.params;

    if (!req.user?.id) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const userId = req.user.id;

    const course = await prisma.course.findUnique({ where: { id } });
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    const existingBookmark = await prisma.courseBookmark.findFirst({
      where: { courseId: id, userId },
    });

    if (existingBookmark) {
      await prisma.courseBookmark.delete({
        where: { id: existingBookmark.id },
      });
      res.json({ message: "Course unbookmarked", bookmarked: false });
    } else {
      await prisma.courseBookmark.create({ data: { courseId: id, userId } });
      res.json({ message: "Course bookmarked", bookmarked: true });
    }
  } catch (error) {
    console.error("Error toggling bookmark:", error);
    res.status(500).json({ error: "Failed to toggle bookmark" });
  }
};

// Enroll in course
export const enrollCourse = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<any> => {
  try {
    const { id } = req.params;

    if (!req.user?.id) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const userId = req.user.id;

    const course = await prisma.course.findUnique({
      where: { id },
      include: { chapters: { select: { id: true } } },
    });

    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    if (!course.isPublic && course.authorId !== userId) {
      return res
        .status(403)
        .json({ error: "Course is not available for enrollment" });
    }

    const existingEnrollment = await prisma.courseEnrollment.findFirst({
      where: { courseId: id, userId },
    });

    if (existingEnrollment) {
      return res.status(400).json({ error: "Already enrolled in this course" });
    }

    const enrollment = await prisma.courseEnrollment.create({
      data: { courseId: id, userId, lastAccessedAt: new Date() },
    });

    res.json({
      message: "Successfully enrolled in course",
      enrollment: {
        id: enrollment.id,
        enrolledAt: enrollment.enrolledAt,
        isCompleted: enrollment.isCompleted,
        progressPercentage: enrollment.progressPercentage,
      },
    });
  } catch (error) {
    console.error("Error enrolling in course:", error);
    res.status(500).json({ error: "Failed to enroll in course" });
  }
};

// Unenroll from course
export const unenrollCourse = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<any> => {
  try {
    const { id } = req.params;

    if (!req.user?.id) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const userId = req.user.id;

    const enrollment = await prisma.courseEnrollment.findFirst({
      where: { courseId: id, userId },
    });

    if (!enrollment) {
      return res.status(404).json({ error: "Not enrolled in this course" });
    }

    await prisma.$transaction([
      prisma.chapterProgress.deleteMany({
        where: { userId, chapter: { courseId: id } },
      }),
      prisma.courseEnrollment.delete({ where: { id: enrollment.id } }),
    ]);

    res.json({ message: "Successfully unenrolled from course" });
  } catch (error) {
    console.error("Error unenrolling from course:", error);
    res.status(500).json({ error: "Failed to unenroll from course" });
  }
};

// Update chapter progress
export const updateChapterProgress = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<any> => {
  try {
    const { courseId, chapterId } = req.params;
    const { isCompleted } = req.body;

    if (!req.user?.id) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const userId = req.user.id;

    const enrollment = await prisma.courseEnrollment.findFirst({
      where: { courseId, userId },
    });

    if (!enrollment) {
      return res
        .status(403)
        .json({ error: "Must be enrolled in course to track progress" });
    }

    const chapter = await prisma.courseChapter.findFirst({
      where: { id: chapterId, courseId },
    });

    if (!chapter) {
      return res.status(404).json({ error: "Chapter not found" });
    }

    const progress = await prisma.chapterProgress.upsert({
      where: { chapterId_userId: { chapterId, userId } },
      update: { isCompleted, completedAt: isCompleted ? new Date() : null },
      create: {
        chapterId,
        userId,
        isCompleted,
        completedAt: isCompleted ? new Date() : null,
      },
    });

    const allChapters = await prisma.courseChapter.findMany({
      where: { courseId },
      select: { id: true },
    });

    const completedChapters = await prisma.chapterProgress.count({
      where: { userId, isCompleted: true, chapter: { courseId } },
    });

    const progressPercentage = Math.round(
      (completedChapters / allChapters.length) * 100
    );
    const isCourseCompleted = progressPercentage === 100;

    await prisma.courseEnrollment.update({
      where: { id: enrollment.id },
      data: {
        progressPercentage,
        isCompleted: isCourseCompleted,
        completedAt:
          isCourseCompleted && !enrollment.completedAt
            ? new Date()
            : enrollment.completedAt,
        lastAccessedAt: new Date(),
      },
    });

    res.json({
      message: "Progress updated successfully",
      progress: {
        isCompleted: progress.isCompleted,
        completedAt: progress.completedAt,
        progressPercentage,
      },
    });
  } catch (error) {
    console.error("Error updating progress:", error);
    res.status(500).json({ error: "Failed to update progress" });
  }
};

// Update course
export const updateCourse = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<any> => {
  try {
    const { id } = req.params;
    const { title, description, topic, isPublic } = req.body;

    const course = await prisma.course.findUnique({ where: { id } });
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    if (!req.user?.id || course.authorId !== req.user.id) {
      return res.status(403).json({ error: "Access denied" });
    }

    const updatedCourse = await prisma.course.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(topic && { topic }),
        ...(typeof isPublic === "boolean" && { isPublic }),
      },
    });

    res.json({ message: "Course updated successfully", course: updatedCourse });
  } catch (error) {
    console.error("Error updating course:", error);
    res.status(500).json({ error: "Failed to update course" });
  }
};

// Delete course
export const deleteCourse = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<any> => {
  try {
    const { id } = req.params;

    const course = await prisma.course.findUnique({ where: { id } });
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    if (!req.user?.id || course.authorId !== req.user.id) {
      return res.status(403).json({ error: "Access denied" });
    }

    await prisma.course.delete({ where: { id } });
    res.json({ message: "Course deleted successfully" });
  } catch (error) {
    console.error("Error deleting course:", error);
    res.status(500).json({ error: "Failed to delete course" });
  }
};

export { optionalAuth };
