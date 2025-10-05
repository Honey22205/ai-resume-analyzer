import { Link } from 'react-router';
import ScoreCircle from '~/components/ScoreCircle';
import React from 'react';

// It's best practice to define the shape of your data.
type Feedback = {
    overallScore: number;
};

type Resume = {
    id: string | number;
    companyName: string;
    jobTitle: string;
    imagePath: string;
    feedback?: Feedback; // Make feedback optional to prevent errors if it's not present
};

// Define the component's props type for clarity and type safety.
type ResumeCardProps = {
    resume: Resume;
};

const ResumeCard: React.FC<ResumeCardProps> = ({ resume }) => {
    const { id, companyName, jobTitle, feedback, imagePath } = resume;

    return (
        <Link to={`/resume/${id}`} className="resume-card animate-in fade-in duration-1000">
            <div className="resume-card-header">
                <div className="flex flex-col gap-2">
                    <h2 className="!text-black font-bold break-words">{companyName}</h2>
                    <h3 className="text-lg breaks-words text-gray-500">{jobTitle}</h3>
                </div>
                <div className="flex-shrink-0">
                    {/* Conditionally render ScoreCircle only if feedback exists to prevent errors */}
                    {feedback && <ScoreCircle score={feedback.overallScore} />}
                </div>
            </div>
            <div className="gradient-border animate-in fade-in duration-1000">
                <div className="w-full h-full">
                    <img
                        src={imagePath}
                        // The alt attribute should be a descriptive string for accessibility
                        alt={`Preview for ${jobTitle} at ${companyName}`}
                        className="w-full h-[350px] max-sm:h-[200px] object-cover object-top"
                    />
                </div>
            </div>
        </Link>
    );
};

export default ResumeCard;