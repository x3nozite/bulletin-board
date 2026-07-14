import { AddItemBox } from "../components/AddItemBox"
import Canvas from "./Canvas"


type Props = {
  name: string
}

export default function page({ }: Props) {
  return (
    <>
      <div>Testing</div>
      <AddItemBox></AddItemBox>

      <div>
        where
        <Canvas></Canvas>
      </div>

    </>
  )
}
