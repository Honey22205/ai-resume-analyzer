import {type FormEvent, useState} from 'react'
import Navbar from "~/components/Navbar";
import FileUploader from "~/components/FileUploader";
import {usePuterStore} from "~/lib/puter";
import {useNavigate} from "react-router";
import {generateUUID} from "~/lib/utils";
import {AIResponseFormat, prepareInstructions} from "../../constants";

// The static import for 'convertPdfToImage' is correctly removed.

const Upload = () => {
    const {auth, isLoading,fs,ai,kv}= usePuterStore();
    const navigate = useNavigate();
    const[isProcessing, setIsProcessing] = useState(false);
    const[statusText, setStatusText] = useState("");
    const [file, setFile] = useState<File | null>(null);

    const handleAnalyze = async ({companyName,jobTitle,jobDescription,file} : { companyName : string ,jobTitle: string,jobDescription: string,file:File}) => {
        setIsProcessing(true);

        // --- FIX 1: Added try...catch block ---
        // This will catch all errors and prevent the UI from getting stuck.
        try {
            setStatusText("Uploading file...");
            const uploadedFile = await fs.upload( [file]);

            if(!uploadedFile) {
                throw new Error("Upload failed. Please try again.");
            }

            setStatusText("Converting to image...");

            // --- FIX 2: Using relative path for the dynamic import ---
            // This solves the 500 Internal Server Error.
            const { convertPdfToImage } = await import('../lib/pdf2img');
            const imageFile = await convertPdfToImage(file);

            if(!imageFile.file) {
                throw new Error(imageFile.error || "Failed to convert PDF to image");
            }

            setStatusText("Uploading the image...");
            const uploadedImage = await fs.upload([imageFile.file]);
            if(!uploadedImage) {
                throw new Error("Image upload failed.");
            }

            setStatusText("Preparing data ...");

            const uuid= generateUUID();

            const data= {
                id:uuid,
                resumePath:  uploadedFile.path,
                imagePath: uploadedImage.path,
                companyName,
                jobTitle,
                jobDescription,
                feedback: '',
            }
            await kv.set(`resume:${uuid}`,JSON.stringify(data));
            setStatusText("Analyzing file...");

            const feedback = await ai.feedback(
                uploadedFile.path,
                prepareInstructions({ jobTitle, jobDescription, AIResponseFormat })
            )
            if(!feedback) {
                throw new Error('Failed to analyze: AI response was empty');
            }

            // This is your Puter.ai response logic
            const feedbackText = typeof feedback.message.content==='string'
                ? feedback.message.content
                : feedback.message.content[0].text;

            // --- FIX 3: Safe JSON parsing ---
            // This prevents errors if the AI adds extra text.
            console.log("Raw AI Response:", feedbackText);
            const jsonMatch = feedbackText.match(/{[\s\S]*}/); // Find the JSON part

            if (!jsonMatch) {
                throw new Error("AI did not return valid JSON. Check console.");
            }

            data.feedback=JSON.parse(jsonMatch[0]); // Parse only the JSON
            await kv.set(`resume:${uuid}`,JSON.stringify(data));
            setStatusText("Analysis Complete");
            navigate(`/resume/${uuid}`);
            console.log(data);

            // Reset UI after a short delay
            setTimeout(() => {
                setIsProcessing(false);
                // You can navigate to the results page here
                // navigate(`/resume/${uuid}`);
            }, 1500);

        } catch (error) {
            console.error("Analysis failed:", error);
            setStatusText(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
            setIsProcessing(false); // Reset the UI so the user can try again
        }
    }

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget.closest('form');
        if(!form) return;
        const formData = new FormData(form);
        const companyName = formData.get('company-name') as string;
        const jobTitle = formData.get('job-title') as string;

        // --- FIX 4: Corrected form field name ---
        // This ensures jobDescription is not null.
        const jobDescription = formData.get('job-description') as string;

        if(!file) {
            // You might want to set a status text here
            // setStatusText("Please select a file to analyze.");
            return;
        }

        handleAnalyze({companyName,jobTitle,jobDescription,file});
    }

    const handleFileSelect = (file: File | null) => {
        setFile(file)
    }
    return (
        <main className="bg-[url('/images/bg-main.svg')] bg-cover">
            <Navbar />
            <section className="main-section">
                <div className="page-heading py-16">
                    <h1> Smart feedback for your dream job </h1>
                    {isProcessing ? (
                        <>
                            <h2>{statusText}</h2>
                            <img src="/images/resume-scan.gif" className="w-full" />
                        </>
                    ) : (
                        <h2>Drop your resume for an ATS Score and improvement tips </h2>
                    )}
                    {!isProcessing && (
                        <form id="upload-form" onSubmit={handleSubmit} className="flex flex-col gap-4 mt-8">
                            <div className="form-div">
                                <label htmlFor="company-name">Company Name</label>
                                <input type="text" name="company-name" placeholder="Company Name" id="company-name" />
                            </div>
                            <div className="form-div">
                                <label htmlFor="job-title">Job Title</label>
                                <input type="text" name="job-title" placeholder="Job Title" id="job-title" />
                            </div>
                            <div className="form-div">
                                {/* --- FIX 5: Corrected form JSX --- */}
                                <label htmlFor="job-description">Job Description</label>
                                <textarea rows={5} name="job-description" placeholder="Job Description" id="job-description" />
                            </div>
                            <div className="form-div">
                                <label htmlFor="uploader">Upload Resume</label>
                                <FileUploader onFileSelect={handleFileSelect} />
                            </div>

                            <button className="primary-button" type="submit">
                                Analyze Resume
                            </button>
                        </form>
                    )}
                </div>
            </section>
        </main>
    );
};

export default Upload;