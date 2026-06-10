export type createCategoryProps={
    name:string,
    description:string,
    image?:HTMLImageElement
    parentId?:string
}
export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  parentId: string | null;
  parent: Category | null;
  children: Category[];
  productCount: number;
    createdAt: string;
    updatedAt:string
};
export type allCategory=Category[]
export type allCategoryResponse={
    success:boolean,
    data:Category[]
}