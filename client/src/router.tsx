import { createBrowserRouter } from "react-router-dom";
import Home from "@/pages/Home/Home";
import NotFound from "@/pages/NotFound/NotFound";
import RootWrapper from "@/layout/RootWrapper";
import MainLayout from "@/layout/Mainlayout";
import ProtectedRoute from "@/components/ProtectedRoute/ProtectedRoute";
import LoginForm from "@/pages/Login/Login";
import SignUpForm from "@/pages/SignUp/SignUp";
import VerificationEmailSent from "@/pages/EmailVerification/VerificationEmailSent";
import VerificationStatus from "@/pages/EmailVerification/VerificationStatus";
import ForgotPassword from "@/pages/ForgotPassword/ForgotPassword";
import PasswordResetForm from "@/pages/ForgotPassword/PasswordResetForm";
import InterviewResourcesPage from "./pages/InterviewResourcesPage/InterviewResourcesPage";
import CoursesPage from "./pages/Courses/CoursesPage";
import CreateCoursePage from "./pages/Courses/CreateCoursePage";
import CourseDetailPage from "./pages/Courses/CourseDetailPage";
import PdfChat from "./pages/PdfChat/PdfChat";

const mainLayoutRoutes = [
  {
    path: "/",
    index: true,
    element: <Home />,
  },{
    path: "/pdf-chat",
    element: <PdfChat />,
  },
  {
    path: "/interview-resources",
    element: <InterviewResourcesPage />,
  },
  {
    path: "/courses",
    element: <CoursesPage />,
  },
  {
    path: "/courses/:id",
    element: <CourseDetailPage />,
  },
];

const protectedRoutes = [
  {
    path: "/courses/create",
    element: <CreateCoursePage />,
  },
];

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootWrapper />,
    children: [
      {
        path: "/",
        element: <ProtectedRoute />,
        children: protectedRoutes,
      },
      {
        path: "/",
        element: <MainLayout />,
        children: mainLayoutRoutes,
      },
      {
        path: "/Login",
        element: <LoginForm />,
      },
      {
        path: "/SignUp",
        element: <SignUpForm />,
      },
      {
        path: "/verifymail",
        element: <VerificationEmailSent />,
      },
      {
        path: "/verifymail/:verificationToken",
        element: <VerificationStatus />,
      },
      {
        path: "/forgot-password",
        element: <ForgotPassword />,
      },
      {
        path: "/reset-password/:resetToken",
        element: <PasswordResetForm />,
      },

      {
        path: "*",
        element: <NotFound />,
      },
    ],
  },
]);

export default router;
