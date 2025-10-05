import type { Route } from "./+types/home";
// import { Welcome } from "../welcome/welcome";
import Navbar from '~/components/Navbar';
import {Link, useLocation, useNavigate} from "react-router";
import { resumes } from "../../constants";
import ResumeCard from '~/components/ResumeCard';
import {usePuterStore} from "~/lib/puter";
import {useEffect} from "react";
export function meta({}: Route.MetaArgs) {
  return [
    { title: "Resumy" },
    { name: "description", content: "Your one way stop for job search!" },
  ];
}

export default function Home() {
  // @ts-ignore
    // @ts-ignore
    const {auth}= usePuterStore();
    const navigate = useNavigate();

    useEffect(() => {
        if (!auth.isAuthenticated) navigate('/auth?next=/');

    }, [auth.isAuthenticated]);
    return <main className="bg-[url('/images/bg-main.svg')] bg-cover">
      <nav className="navbar">
          <Link to="/">
              <p className="text-2xl font-bold text-gradient">Resumy</p>
          </Link>
          <Link to="/upload" className="primary-button w-fit">
              Upload Resume
          </Link>
      </nav>

      <section className="main-section">
          <div className="page-heading py-16">
              <h1> Track Your Applications & Resume Ratings </h1>
              <h2> Review your submissions and check AI-powered feedback.</h2>
          </div>



        {resumes.length > 0 && (
            <div className="resumes-section">
                {resumes.map((resume) => (
                    <ResumeCard key={resume.id} resume={resume} />
                ))}
            </div>
        )}
      </section>
  </main>
}
