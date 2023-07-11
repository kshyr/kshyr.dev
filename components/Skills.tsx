import { cn } from "@/lib/utils";
import Image from "next/image";
import { skills, Skill } from "@/app/skills";

export default function Skills() {
  return (
    <>
      {skills.map((skill) => {
        return <SkillTag skill={skill} key={skill.name} />;
      })}
    </>
  );
}

function SkillTag({ skill }: { skill: Skill }) {
  return (
    <div className="flex cursor-pointer select-none items-center gap-2 rounded-md border border-border px-2 py-1 transition-colors dark:bg-primary/5 dark:hover:bg-primary/10">
      <Image
        draggable={false}
        src={skill.logoSrc}
        alt={skill.name + " logo"}
        width={skill.customWidth ?? 24}
        height={skill.customHeight ?? 24}
        className={cn(
          "m-0 rounded-none border-none shadow-none",
          skill?.twClasses
        )}
      />
      <span className="font-display text-[15px] font-normal">{skill.name}</span>
    </div>
  );
}
