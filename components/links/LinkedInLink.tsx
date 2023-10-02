import Image from "next/image";

export default function LinkedInLink() {
  return (
    <a
      href="https://www.linkedin.com/in/kostiantyn-shyrolapov/"
      target="_blank"
      className="mr-9 cursor-default pb-1"
    >
      <Image
        alt="linkedin logo"
        width={25}
        height={20}
        src="https://www.svgrepo.com/show/144030/linkedin-square-logo.svg"
        className="cursor-pointer rounded-[5px] border-none shadow-none transition-transform duration-200 ease-in-out hover:scale-110  dark:invert"
      />
    </a>
  );
}
