import Image from "next/image";

export default function LinkedInLink() {
  return (
    <a
      href="https://www.linkedin.com/in/kostiantyn-shyrolapov/"
      target="_blank"
      className="mr-9 pb-1"
    >
      <Image
        alt="2"
        width={25}
        height={25}
        src="https://www.svgrepo.com/show/144030/linkedin-square-logo.svg"
        className="rounded-[5px] border-none shadow-none dark:invert"
      />
    </a>
  );
}
