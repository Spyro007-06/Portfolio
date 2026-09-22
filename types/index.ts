export interface Project {
  idx: string;
  count: string;
  tag: string;
  title: string;
  subtitle: string;
  category: string;
  year: string;
  desc: string;
  pointsLabel?: string;
  points?: string[];
  flow?: {
    label: string;
    steps: string[];
  };
  link: string | null;
  mock: string;
}

export interface SkillItem {
  name: string;
  info: string;
}

export interface SkillGroup {
  group: string;
  items: SkillItem[];
}

export interface ApproachItem {
  idx: string;
  title: string;
  copy: string;
}

export interface ExperienceItem {
  year: string;
  role: string;
  org: string;
  desc: string;
  focus: string[];
}

export interface EducationItem {
  institution: string;
  field: string;
  period: string;
}

export interface CertificationItem {
  title: string;
  status: string;
}
