import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import api from "@/config/axiosInstance";
import { backendUrl } from "@/config/backendUrl";

const jobRoles = [
  "Frontend Developer",
  "Backend Developer",
  "React Developer",
  "Full Stack Developer",
  "MERN Developer",
  "Data Scientist",
  "Machine Learning Engineer",
  "Product Manager",
  "DevOps Engineer",
];



const models = ["Ege", "Awais", "Andre", "Zaid"];

const InterviewHelp = () => {
  const navigate = useNavigate();


  const [formData, setFormData] = useState({
    title: "",
    description: "",
    jobRole: "",
    model: "",
    extraInfo: "",
  });
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        data.append(key, value);
      });
      if (resumeFile) {
        data.append("resume", resumeFile);
      }

      const response = await api.post(`${backendUrl}/api/v1/interview/create`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("Interview created:", response.data);
      navigate("/your-interviews");
    } catch (err: any) {
      console.error("Error submitting form:", err);
      setError("Failed to create interview. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Create New Interview</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="resume">Upload Resume</Label>
              <Input
                id="resume"
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={e => {
                  if (e.target.files && e.target.files[0]) {
                    setResumeFile(e.target.files[0]);
                  }
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">Interview Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Enter interview title"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Enter interview description"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="jobRole">Job Role</Label>
              <Select
                value={formData.jobRole}
                onValueChange={(value) =>
                  setFormData({ ...formData, jobRole: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select job role" />
                </SelectTrigger>
                <SelectContent>
                  {jobRoles.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="model">Select Model</Label>
              <Select
                value={formData.model}
                onValueChange={(value) =>
                  setFormData({ ...formData, model: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select AI model" />
                </SelectTrigger>
                <SelectContent>
                  {models.map((model) => (
                    <SelectItem key={model} value={model}>
                      {model}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="extraInfo">Extra Information (Optional)</Label>
              <Textarea
                id="extraInfo"
                value={formData.extraInfo}
                onChange={(e) =>
                  setFormData({ ...formData, extraInfo: e.target.value })
                }
                placeholder="Add any additional information..."
                className="min-h-[100px]"
              />
            </div>

            {error && <p className="text-red-500">{error}</p>}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating..." : "Create Interview"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default InterviewHelp;
