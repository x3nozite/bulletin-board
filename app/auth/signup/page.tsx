import Image from "next/image";

const page = () => {
  return (
    <div className="flex items-center justify-center p-2 bg-cyan-200 h-screen">
      <div className="w-1/2">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={100}
          height={20}
          priority
        />
      </div>
      <div className="w-1/2 h-full">
        form
      </div>
    </div>
  )
}

export default page
