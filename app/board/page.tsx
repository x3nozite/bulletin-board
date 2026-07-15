import { AddItemBox } from "../components/AddItemBox"
import Canvas from "./Canvas"


type Props = {
  name: string
}

export default function page({ }: Props) {
  return (
    <>
      <div className="border-2 border-solid border-gray-500 flex justify-center w-fit p-4 fixed mx-auto top-4 inset-x-0 z-10">
        <AddItemBox></AddItemBox>
      </div>

      <div className="bg-white">
        <Canvas></Canvas>
      </div>

    </>
  )
}
