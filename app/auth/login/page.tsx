import LoginForm from "./loginForm"
import Image from "next/image";

const page = () => {
  return (
    <div className="flex items-center justify-center p-2 bg-amber-950">
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
      <div className="w-1/2">
        <LoginForm></LoginForm>
      </div>
    </div>
  )
}

export default page
