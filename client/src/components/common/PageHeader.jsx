import { Breadcrumb } from "../ui";

export default function PageHeader({ title, description, action, breadcrumbs }) {
  return <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div>{breadcrumbs && <div className="mb-3"><Breadcrumb items={breadcrumbs} /></div>}<h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>{description && <p className="mt-2 text-slate-400">{description}</p>}</div>{action}</div>;
}
