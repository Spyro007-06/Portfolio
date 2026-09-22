"use client";

import { ReactNode } from "react";

interface SectionLabelProps {
  number: string;
  name: string;
}

export default function SectionLabel({ number, name }: SectionLabelProps) {
  return (
    <div className="section-label">
      <span>{number}</span>
      <span>{name}</span>
    </div>
  );
}