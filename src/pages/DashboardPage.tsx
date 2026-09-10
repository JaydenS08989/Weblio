import {
  Copy,
  ExternalLink,
  Eye,
  LayoutGrid,
  LogOut,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import type React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore, useEditorStore } from "@/store";

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const projects = useEditorStore((state) => state.projects);
  const createProject = useEditorStore((state) => state.createProject);
  const openProject = useEditorStore((state) => state.openProject);
  const renameProject = useEditorStore((state) => state.renameProject);
  const duplicateProject = useEditorStore((state) => state.duplicateProject);
  const deleteProject = useEditorStore((state) => state.deleteProject);
  const signOut = useAuthStore((state) => state.signOut);
  const user = useAuthStore((state) => state.user);
  const [query, setQuery] = useState("");
  const visibleProjects = projects.filter((project) =>
    project.name.toLowerCase().includes(query.toLowerCase()),
  );

  const create = () => navigate(`/editor/${createProject()}`);
  const formatUpdatedAt = (value: string) => {
    const days = Math.floor(
      (Date.now() - new Date(value).getTime()) / 86_400_000,
    );
    if (days <= 0) return "Edited today";
    if (days === 1) return "Edited yesterday";
    if (days < 30) return `Edited ${days} days ago`;
    return `Edited ${new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value))}`;
  };

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
          <div className="avatar">
            {user?.name
              .split(" ")
              .map((part) => part[0])
              .join("")
              .slice(0, 2) ?? "WU"}
          </div>
          <div>
            <strong>{user?.name ?? "Weblio user"}</strong>
            <span>{user?.email ?? "Local demo session"}</span>
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
                    {project.status} · {formatUpdatedAt(project.updatedAt)}
                  </p>
                </div>
                <details className="project-actions">
                  <summary
                    className="icon-button"
                    aria-label={`More actions for ${project.name}`}
                  >
                    •••
                  </summary>
                  <div className="project-menu">
                    <button
                      type="button"
                      onClick={() => navigate(`/preview/${project.id}`)}
                    >
                      <Eye /> Preview
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const name = window.prompt("Rename site", project.name);
                        if (name) renameProject(project.id, name);
                      }}
                    >
                      <Pencil /> Rename
                    </button>
                    <button
                      type="button"
                      onClick={() => duplicateProject(project.id)}
                    >
                      <Copy /> Duplicate
                    </button>
                    <button
                      type="button"
                      className="danger"
                      onClick={() => {
                        if (
                          window.confirm(
                            `Delete ${project.name}? This cannot be undone.`,
                          )
                        )
                          deleteProject(project.id);
                      }}
                    >
                      <Trash2 /> Delete
                    </button>
                  </div>
                </details>
              </div>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
};

export default DashboardPage;
