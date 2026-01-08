"use client";

import React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Edit2, Check, X } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { readStorePixKey } from "@/features/admin/stores/pix-key/read";
import { updateStorePixKey } from "@/features/admin/stores/pix-key/update";

// Schema de validação
const pixKeySchema = z.object({
  pix_key: z.string().min(1, "Chave PIX é obrigatória"),
});

type PixKeyFormData = z.infer<typeof pixKeySchema>;

export default function PixKeyManager() {
  const [isEditing, setIsEditing] = React.useState(false);
  const queryClient = useQueryClient();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PixKeyFormData>({
    resolver: zodResolver(pixKeySchema),
    defaultValues: {
      pix_key: "",
    },
  });

  // Query para ler a chave PIX
  const { data, isLoading } = useQuery({
    queryKey: ["storePixKey"],
    queryFn: async () => {
      const [result, error] = await readStorePixKey();
      if (error) {
        throw new Error(error.message);
      }
      return result;
    },
  });

  // Mutation para atualizar a chave PIX
  const updateMutation = useMutation({
    mutationFn: async (data: PixKeyFormData) => {
      const [result, error] = await updateStorePixKey(data);
      if (error) {
        throw new Error(error.message);
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["storePixKey"] });
      setIsEditing(false);
    },
  });

  const onSubmit = (data: PixKeyFormData) => {
    updateMutation.mutate(data);
  };

  const handleEdit = () => {
    reset({
      pix_key: data?.store?.pix_key || "",
    });
    setIsEditing(true);
  };

  const handleCancel = () => {
    reset({
      pix_key: data?.store?.pix_key || "",
    });
    setIsEditing(false);
  };

  React.useEffect(() => {
    if (data?.store?.pix_key) {
      reset({
        pix_key: data.store.pix_key,
      });
    }
  }, [data, reset]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Chave PIX</CardTitle>
        <CardDescription>Gerencie a chave PIX da sua loja</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="py-8 text-center text-muted-foreground">
            Carregando...
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="pix_key"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed
                  peer-disabled:opacity-70"
              >
                Chave PIX
              </label>
              <Controller
                name="pix_key"
                control={control}
                render={({ field }) => (
                  <Input
                    id="pix_key"
                    placeholder="Digite sua chave PIX"
                    disabled={!isEditing}
                    {...field}
                  />
                )}
              />
              {errors.pix_key && (
                <p className="text-sm font-medium text-destructive">
                  {errors.pix_key.message}
                </p>
              )}
            </div>

            <div className="flex gap-3">
              {!isEditing ? (
                <Button type="button" onClick={handleEdit}>
                  <Edit2 className="w-4 h-4 mr-2" />
                  Editar
                </Button>
              ) : (
                <>
                  <Button
                    type="button"
                    onClick={handleSubmit(onSubmit)}
                    disabled={updateMutation.isPending}
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Salvar
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    disabled={updateMutation.isPending}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancelar
                  </Button>
                </>
              )}
            </div>

            {updateMutation.isError && (
              <Alert variant="destructive">
                <AlertDescription>
                  {updateMutation.error?.message ||
                    "Erro ao atualizar a chave PIX"}
                </AlertDescription>
              </Alert>
            )}

            {updateMutation.isSuccess && (
              <Alert>
                <AlertDescription>
                  Chave PIX atualizada com sucesso!
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
