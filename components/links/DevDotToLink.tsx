import Image from "next/image";

export default function DevDotToLink() {
  return (
    <a target="_blank" href="https://dev.to/kshyr" className="mb-1">
      <Image
        src="dev-to.svg"
        width={24}
        height={24}
        className="m-0 w-6 border-none invert-0 dark:invert"
        alt="dev.to logo"
      />
    </a>
  );
}
