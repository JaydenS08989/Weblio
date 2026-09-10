import {
  ExternalLink,
  LayoutGrid,
  LogOut,
  MoreHorizontal,
  Plus,
  Search,
} from "lucide-react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore, useEditorStore } from "@/store";

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const projects = useEditorStore((state) => state.projects);
  const createProject = useEditorStore((state) => state.createProject);
  const openProject = useEditorStore((state) => state.openProject);
  const signOut = useAuthStore((state) => state.signOut);
  const [query, setQuery] = useState("");
  const visibleProjects = projects.filter((project) =>
    project.name.toLowerCase().includes(query.toLowerCase()),
  );
  const create = () => navigate(`/editor/${createProject()}`);
  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="logo dark">
          <span>W</span> Weblio
        </div>
        <nav>
          <button type="button" className="nav-active">
            <LayoutGrid />
            Sites
          </button>
        </nav>
        <div className="user-area">
          <div className="avatar">AM</div>
          <div>
            <strong>Alex Morgan</strong>
            <span>alex@northstar.design</span>
          </div>
          <button
            type="button"
            className="icon-button"
            onClick={() => {
              signOut();
              navigate("/auth/sign-in");
            }}
            aria-label="Sign out"
          >
            <LogOut />
          </button>
        </div>
      </header>
      <main className="dashboard-main">
        <div className="dashboard-intro">
          <div>
            <span className="eyebrow">Workspace</span>
            <h1>Your sites</h1>
            <p>Create, manage, and bring your next idea to life.</p>
          </div>
          <button type="button" className="button primary" onClick={create}>
            <Plus />
            Create new site
          </button>
        </div>
        <div className="dashboard-filters">
          <label className="search">
            <Search />
            <span className="sr-only">Search projects</span>
            <input
              placeholder="Search sites"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          <span>
            {visibleProjects.length}{" "}
            {visibleProjects.length === 1 ? "site" : "sites"}
          </span>
        </div>
        <section className="project-grid" aria-label="Your sites">
          <button type="button" className="new-project-card" onClick={create}>
            <span>
              <Plus />
            </span>
            <strong>Start a new site</strong>
            <small>Begin with a thoughtfully structured canvas</small>
          </button>
          {visibleProjects.map((project, index) => (
            <article className="project-card" key={project.id}>
              <button
                type="button"
                className={`project-thumbnail thumb-${index % 3}`}
                onClick={() => {
                  openProject(project.id);
                  navigate(`/editor/${project.id}`);
                }}
              >
                <div className="mini-site">
                  <b>{project.name}</b>
                  <span />
                  <span />
                  <i>Explore</i>
                </div>
                <span className="open-overlay">
                  Open editor <ExternalLink />
                </span>
              </button>
              <div className="project-meta">
                <div>
                  <h2>{project.name}</h2>
                  <p>
                    <span className={`status ${project.status}`} />
                    {project.status} · Edited recently
                  </p>
                </div>
                <button
                  type="button"
                  className="icon-button"
                  aria-label={`More actions for ${project.name}`}
                >
                  <MoreHorizontal />
                </button>
              </div>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
};
export default DashboardPage;
