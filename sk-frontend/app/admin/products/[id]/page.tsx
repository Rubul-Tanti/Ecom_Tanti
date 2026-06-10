import AdminProductEdit from "@/components/admin/product/product"

type Props = {
  params: Promise<{ id: string }>
}

const Page = async ({ params }: Props) => {
  const { id } = await params
  return <AdminProductEdit id={id}/>
}

export default Page