import Image from "next/image";

export default function DevDotToLink() {
  return (
    <div className="mb-1 flex">
      <a href="dsds">
        <Image
          src="dev-to.svg"
          width={24}
          height={24}
          className="m-0 border-none invert-0 dark:invert"
          alt="dev.to logo"
        />
      </a>
    </div>
  );
}
