"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { CategoryType } from "@/models/category";
import {
  ProductImageType,
  ProductType,
  ProductVariationType,
} from "@/models/product";
import { Loader, Plus } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { createProduct, deleteProductImage, updateProduct } from "../actions";
import { readProductImages, uploadImages } from "../client-actions";
import { createProductVariations } from "./actions";
import { FileType } from "./file-uploader";
import { ProductImages } from "./product-images";
import { ProductInfo } from "./product-info";

export const newProductFormSchema = z.object({
  category_id: z.string().min(1),
  name: z.string({ required_error: "Por favor, preencha o nome do produto." }),
  kitchen_observations: z.array(z.string().optional()),
  description: z.string({ required_error: "Por favor, insira uma descrição." }),
  price: z.string().optional(),
  promotional_price: z.string().optional(),
  stock: z.string().optional(),
  sku: z.string().optional(),
  allows_extras: z.boolean().optional(),
  pkg_weight: z.string().optional(),
  pkg_length: z.string().optional(),
  pkg_width: z.string().optional(),
  pkg_height: z.string().optional(),
});

export function ProductForm({
  categories,
  product,
}: {
  categories: CategoryType[] | null;
  product: ProductType | null;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const categoryId = searchParams.get("category_id");

  const defaultVariations =
    product?.product_variations?.map((variation) => ({
      id: variation.id,
      name: variation.name,
      price: variation.price,
      stock: variation.stock,
      product_id: variation.product_id,
      attribute_id: variation.attributes.id,
      created_at: variation.created_at,
      attributes: {
        id: variation.attributes.id,
        name: variation.attributes.name,
        created_at: variation.attributes.created_at,
      },
    })) ?? [];

  const groupedVariationsArray: ProductVariationType[] = defaultVariations;

  const [files, setFiles] = useState<FileType[]>([]);
  const [productImages, setProductImages] = useState<ProductImageType[]>([]);
  const [variationsForm, setVariationsForm] = useState<ProductVariationType[]>(
    groupedVariationsArray,
  );

  const pathnameParts = pathname.split("/");
  pathnameParts.pop();
  pathnameParts.pop();
  const redirectTo = pathnameParts.join("/");

  const productId = product?.id;

  const form = useForm<z.infer<typeof newProductFormSchema>>({
    resolver: zodResolver(newProductFormSchema),
    defaultValues: {
      name: product?.name ?? undefined,
      description: product?.description ?? undefined,
      kitchen_observations: product?.kitchen_observations ?? undefined,
      price: product?.price?.toString() ?? undefined,
      promotional_price: product?.promotional_price?.toString() ?? undefined,
      stock: product?.stock?.toString() ?? "",
      category_id: product?.category_id ?? categoryId ?? undefined,
      sku: product?.sku ?? undefined,
      allows_extras: product?.allows_extras ?? false,
      pkg_weight: product?.pkg_weight?.toString() ?? undefined,
      pkg_length: product?.pkg_length?.toString() ?? undefined,
      pkg_width: product?.pkg_width?.toString() ?? undefined,
      pkg_height: product?.pkg_height?.toString() ?? undefined,
    },
  });

  const formState = form.formState;

  async function handleReadProductImages() {
    if (productId) {
      const { productImages, productImagesError } =
        await readProductImages(productId);

      if (productImagesError) {
        console.error(productImagesError);
      }

      setProductImages(productImages);
    }
  }

  async function handleDeleteImage(imageId: string) {
    const { tableError, storageError } = await deleteProductImage(imageId);

    if (tableError) {
      console.error(tableError);
      return null;
    }

    if (storageError) {
      console.error(storageError);
      return null;
    }

    handleReadProductImages();
  }

  async function onSubmit(values: z.infer<typeof newProductFormSchema>) {
    if (!productId) {
      const { createdProduct, createdProductError } =
        await createProduct(values);

      if (createdProductError) {
        console.error(createdProductError);
        return;
      }

      if (createdProduct) {
        if (files.length > 0) {
          const { uploadErrors } = await uploadImages(files, createdProduct.id);

          if (uploadErrors) {
            console.error(uploadErrors);
          }
        }
      }

      if (variationsForm.length > 0 && createdProduct) {
        await createProductVariations(variationsForm, createdProduct.id);
      }

      return router.back();
    }

    const { error } = await updateProduct(productId, values);

    if (error) {
      console.error(error);
      return null;
    }

    if (files.length > 0 && productId) {
      const { uploadErrors } = await uploadImages(files, productId);

      if (uploadErrors) {
        console.error(uploadErrors);
      }
    }

    if (variationsForm.length > 0) {
      await createProductVariations(variationsForm, productId);
    }

    toast("Produto atualizado com sucesso!");
  }

  useEffect(() => {
    if (productId) {
      handleReadProductImages();
    }
  }, [productId]); //eslint-disable-line

  if (!categories || categories?.length === 0) {
    return (
      <div className="flex flex-col items-start gap-4">
        <h1 className="text-xl font-bold">
          Você ainda não tem categorias cadastradas
        </h1>
        <p className="text-sm text-muted-foreground">
          Para adicionar produtos, primeiro crie uma categoria.
        </p>
        <Link
          href={`${redirectTo}/categories/register?back=new-product`}
          className={buttonVariants()}
        >
          <Plus className="w-4 h-4 mr-2" />
          Adicionar categoria
        </Link>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col w-full space-y-6 pb-16"
      >
        <div className="flex flex-col w-full space-y-6">
          <ProductImages
            files={files}
            setFiles={setFiles}
            productImages={productImages}
            handleDeleteImage={handleDeleteImage}
          />

          <ProductInfo form={form} categories={categories} />

          <FormField
            control={form.control}
            name="allows_extras"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                <div className="space-y-0.5">
                  <FormLabel>Permitir adicionais</FormLabel>
                  <FormDescription>
                    Permite que o cliente possa escolher produtos adicionais.
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          {/* <Variations
            variations={variationsForm}
            setVariations={setVariationsForm}
          /> */}

          {/* <Dimensions form={form} /> */}

          <footer className="fixed bottom-0 left-0 right-0 flex p-4">
            <Button
              type="submit"
              disabled={formState.isSubmitting}
              className="w-full max-w-sm ml-auto"
            >
              {formState.isSubmitting && (
                <Loader className="w-4 h-4 mr-2 animate-spin" />
              )}
              {productId ? "Salvar alterações" : "Criar produto"}
            </Button>
          </footer>
        </div>
      </form>
    </Form>
  );
}
