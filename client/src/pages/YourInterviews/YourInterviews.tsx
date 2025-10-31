import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlayCircle, FileText } from "lucide-react";
import { encodePassphrase, randomString } from "@/lib/client-utils";
import api from "@/config/axiosInstance";
import moment from "moment";
import { backendUrl } from "@/config/backendUrl";

const jobRoleImages: { [key: string]: string } = {
  "Frontend Developer":
    "https://miro.medium.com/v2/resize:fit:826/1*t9VEDxOAAzBZoa2ZjCQo7A.png",
  "Backend Developer":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/React-icon.svg/768px-React-icon.svg.png",
  "React Developer":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/React-icon.svg/768px-React-icon.svg.png",
  "Full Stack Developer":
    "https://media.geeksforgeeks.org/wp-content/cdn-uploads/20190626123927/untitlsssssed.png",
  "MERN Developer":
    "https://almablog-media.s3.ap-south-1.amazonaws.com/MERN_Stack_9437df2ba9_62af1dd3fc.png",
  "Data Scientist": "https://cdn-icons-png.flaticon.com/512/4824/4824797.png",
  "Machine Learning Engineer":
    "https://t4.ftcdn.net/jpg/03/98/18/19/360_F_398181949_BudYmmAeTPJwDz6HMxwf1PL3ZNIblohm.jpg",
  "Product Manager":
    "https://cdn.iconscout.com/icon/free/png-256/free-product-manager-icon-download-in-svg-png-gif-file-formats--management-cog-cogwheel-business-and-vol-2-pack-icons-1153021.png",
  "DevOps Engineer":
    "https://miro.medium.com/v2/resize:fit:1400/0*xDsDpJsXjq55Dzda.png",
};

const YourInterviews = () => {
  const navigate = useNavigate();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [e2ee, setE2ee] = useState(false);
  const [sharedPassphrase, setSharedPassphrase] = useState(randomString(64));

  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        const response = await api.get(
          `${backendUrl}/api/v1/interview/getinterviews`
        );
        setInterviews(response.data);
      } catch (error) {
        console.error("Failed to fetch interviews:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInterviews();
  }, []);

  const startMeeting = (interviewId: string) => {
    if (e2ee) {
      navigate(
        `/interview/${interviewId}#${encodePassphrase(sharedPassphrase)}`
      );
    } else {
      navigate(`/interview/${interviewId}`);
    }
  };

  if (loading) {
    return <div className="text-center py-10">Loading interviews...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Your Interviews</h1>
      <div className="grid gap-6">
        {interviews.map((interview: any) => (
          <Card key={interview.id}>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>{interview.title}</span>
                <span className="text-sm font-normal text-gray-500">
                  {moment(interview.createdAt).format(
                    "MMMM Do YYYY, h:mm:ss A"
                  )}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Job Role</p>
                      <p className="font-medium">{interview.jobRole}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">AI Model</p>
                      <p className="font-medium">{interview.model}</p>
                    </div>
                  </div>
                  <p className="text-gray-600">{interview.description}</p>
                  {!interview.isCompleted && (
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center gap-2">
                        <input
                          id={`use-e2ee-${interview.id}`}
                          type="checkbox"
                          checked={e2ee}
                          onChange={(ev) => setE2ee(ev.target.checked)}
                        />
                        <label htmlFor={`use-e2ee-${interview.id}`}>
                          Enable end-to-end encryption
                        </label>
                      </div>
                      {e2ee && (
                        <div className="flex items-center gap-2">
                          <label htmlFor={`passphrase-${interview.id}`}>
                            Passphrase
                          </label>
                          <input
                            id={`passphrase-${interview.id}`}
                            type="password"
                            value={sharedPassphrase}
                            onChange={(ev) =>
                              setSharedPassphrase(ev.target.value)
                            }
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {interview.isCompleted && !interview.isResultEvaluated && (
                    <div className="flex items-center text-gray-500 text-sm italic">
                      <svg
                        className="animate-spin h-5 w-5 mr-2 text-gray-500"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                        />
                      </svg>
                      Evaluating Results (Check again after some time)...
                    </div>
                  )}

                  <div className="flex gap-4 pt-4">
                    {!interview.isCompleted && (
                      <Button
                        className="flex-1 cursor-pointer"
                        onClick={() => startMeeting(interview.id)}
                      >
                        <PlayCircle className="w-4 h-4 mr-2" />
                        Start
                      </Button>
                    )}

                    {interview.isResultEvaluated && (
                      <Link to={`/interview/results/${interview.id}`}>
                        <Button
                          variant="default"
                          className="flex-1 cursor-pointer w-full bg-emerald-800"
                        >
                          <FileText className="w-4 h-4 mr-2" />
                          Results
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>

                {interview.jobRole && jobRoleImages[interview.jobRole] && (
                  <div className="w-full md:w-1/3 flex justify-center items-center">
                    <img
                      src={jobRoleImages[interview.jobRole]}
                      alt={interview.jobRole}
                      className="rounded-lg shadow-md max-h-48 object-contain"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default YourInterviews;
