import { Resend } from "resend";
import { projects } from "@/lib/projects";
import { experience, whoami, contact } from "@/lib/copy";

export const TOOL_DEFINITIONS = [
  {
    type: "function" as const,
    function: {
      name: "browse_projects",
      description:
        "Get detailed information about Sanath's projects and work experience. Use when asked for specifics about a project, role, or technology.",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description:
              "Optional filter: project name (antm, c0py, motiv8, aipt, ellie) or company (npci, statwig, excelerate, motiv8, buildup) or technology",
          },
        },
        required: [],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "send_email",
      description:
        "Send a contact email to Sanath on behalf of a visitor. ONLY call this after collecting their name, email, and message, AND after showing a confirmation summary and receiving explicit user confirmation.",
      parameters: {
        type: "object",
        properties: {
          from_name: { type: "string", description: "Sender's full name" },
          from_email: { type: "string", description: "Sender's email address" },
          message: { type: "string", description: "The message to send to Sanath" },
        },
        required: ["from_name", "from_email", "message"],
      },
    },
  },
];

function browseProjects(query?: string): unknown {
  const q = (query ?? "").toLowerCase();

  const matchedProjects = q
    ? projects.filter(
        (p) =>
          p.id.includes(q) ||
          p.title.toLowerCase().includes(q) ||
          p.stack.some((s) => s.toLowerCase().includes(q)) ||
          p.longBlurb.toLowerCase().includes(q),
      )
    : projects;

  const matchedRoles = q
    ? experience.filter(
        (e) =>
          e.id.includes(q) ||
          e.company.toLowerCase().includes(q) ||
          e.title.toLowerCase().includes(q) ||
          e.tags.some((t) => t.toLowerCase().includes(q)) ||
          e.bullets.some((b) => b.toLowerCase().includes(q)),
      )
    : experience;

  return {
    projects: matchedProjects.map((p) => ({
      id: p.id,
      title: p.title,
      url: p.url,
      blurb: p.longBlurb,
      stack: p.stack,
      status: p.status,
    })),
    experience: matchedRoles.map((e) => ({
      id: e.id,
      title: e.title,
      company: e.company,
      period: e.period,
      current: e.current ?? false,
      bullets: e.bullets,
      tags: e.tags,
    })),
    profile: {
      bio: whoami.bio,
      stack: whoami.stack,
      contact: contact.links.map((l) => ({ label: l.label, value: l.value, href: l.href })),
    },
  };
}

async function sendEmail(
  fromName: string,
  fromEmail: string,
  message: string,
): Promise<{ sent: boolean } | { error: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_EMAIL;

  if (!apiKey || !to) {
    return { error: "email service not configured" };
  }

  try {
    const resend = new Resend(apiKey);
    await resend.emails.send({
      from: "Portfolio Contact <onboarding@resend.dev>",
      to,
      subject: `Portfolio contact from ${fromName}`,
      text: `From: ${fromName} <${fromEmail}>\n\n${message}`,
      html: `<p><strong>From:</strong> ${fromName} &lt;${fromEmail}&gt;</p><p>${message.replace(/\n/g, "<br>")}</p>`,
    });
    return { sent: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "send failed" };
  }
}

export async function runTool(
  name: string,
  args: Record<string, unknown>,
): Promise<unknown> {
  if (name === "browse_projects") {
    return browseProjects(args.query as string | undefined);
  }
  if (name === "send_email") {
    return sendEmail(
      args.from_name as string,
      args.from_email as string,
      args.message as string,
    );
  }
  return { error: `unknown tool: ${name}` };
}
