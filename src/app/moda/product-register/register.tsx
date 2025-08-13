'use client'

import { uploadImages } from '@/app/admin/(protected)/(app)/catalog/products/register/client-actions'
import {
  FileType,
  FileUploader,
} from '@/app/admin/(protected)/(app)/catalog/products/register/form/file-uploader'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { createClient } from '@/lib/supabase/client'
import { formatCurrencyBRL } from '@/lib/utils'
import { Edit, Plus, Trash2, X } from 'lucide-react'
import Image from 'next/image'
import { useQueryState } from 'nuqs'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

type Product = {
  id: string
  created_at: string
  name: string
  description?: string
  price: number | null
  promotional_price: number | null
  stock: number | null
  category_id: string
  amount_sold: number
  store_id: string | null
  sku: string | null
  pkg_weight: number | null
  pkg_length: number | null
  pkg_width: number | null
  pkg_height: number | null
  product_url: string | null
  allows_extras: boolean
  need_choices: boolean | null
  status: 'active' | 'inactive'
}

type ProductImage = {
  id: string
  created_at: string
  product_id: string
  image_url: string
}

type Category = {
  id: string
  name: string
}

type Store = {
  id: string
  name: string
}

const initialProduct: Omit<Product, 'id' | 'created_at' | 'amount_sold'> = {
  name: '',
  description: '',
  price: null,
  promotional_price: null,
  stock: null,
  category_id: '',
  store_id: null,
  sku: '',
  pkg_weight: null,
  pkg_length: null,
  pkg_width: null,
  pkg_height: null,
  product_url: '',
  allows_extras: true,
  need_choices: false,
  status: 'active',
}

export default function ProductManagement() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [stores, setStores] = useState<Store[]>([]) // <-- adicionado
  const [productImages, setProductImages] = useState<
    Record<string, ProductImage[]>
  >({})
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState(initialProduct)
  const [files, setFiles] = useState<FileType[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [viewingImages, setViewingImages] = useState<string | null>(null)

  // filtros com nuqs
  const [storeFilter, setStoreFilter] = useQueryState('store', {
    defaultValue: 'all',
  })
  const [searchQuery, setSearchQuery] = useQueryState('search', {
    defaultValue: '',
  })

  const supabase = createClient()

  useEffect(() => {
    loadStores()
  }, [])

  // Carregar dados sempre que filtros mudarem
  useEffect(() => {
    loadProducts()
    loadCategories()
  }, [storeFilter, searchQuery])

  const loadStores = async () => {
    try {
      const { data, error } = await supabase
        .from('stores')
        .select('id, name')
        .order('name')

      if (error) throw error
      setStores(data || [])
    } catch (error) {
      console.error('Erro ao carregar lojas:', error)
    }
  }

  const loadProducts = async () => {
    try {
      let query = supabase.from('products').select('*').order('created_at', {
        ascending: false,
      })

      if (storeFilter && storeFilter !== 'all') {
        query = query.eq('store_id', storeFilter)
      }

      if (searchQuery) {
        query = query.ilike('name', `%${searchQuery}%`)
      }

      const { data, error } = await query

      if (error) throw error
      setProducts(data || [])

      if (data && data.length > 0) {
        const productIds = data.map((p) => p.id)
        loadProductImages(productIds)
      }
    } catch (error) {
      console.error('Erro ao carregar produtos:', error)
      toast.error('Erro ao carregar produtos')
    }
  }

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name')
        .order('name')

      if (error) throw error
      setCategories(data || [])
    } catch (error) {
      console.error('Erro ao carregar categorias:', error)
    }
  }

  const loadProductImages = async (productIds: string[]) => {
    try {
      const { data, error } = await supabase
        .from('product_images')
        .select('*')
        .in('product_id', productIds)

      if (error) throw error

      const imagesByProduct: Record<string, ProductImage[]> = {}
      data?.forEach((image) => {
        if (!imagesByProduct[image.product_id]) {
          imagesByProduct[image.product_id] = []
        }
        imagesByProduct[image.product_id].push(image)
      })

      setProductImages(imagesByProduct)
    } catch (error) {
      console.error('Erro ao carregar imagens:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      let productId: string

      if (selectedProduct) {
        const { error } = await supabase
          .from('products')
          .update(formData)
          .eq('id', selectedProduct.id)

        if (error) throw error
        productId = selectedProduct.id
        toast.success('Produto atualizado com sucesso!')
      } else {
        const { data, error } = await supabase
          .from('products')
          .insert([formData])
          .select()
          .single()

        if (error) throw error
        productId = data.id
        toast.success('Produto criado com sucesso!')
      }

      if (files.length > 0) {
        const { uploadErrors, insertErrors } = await uploadImages(
          files,
          productId,
        )

        if (uploadErrors || insertErrors) {
          console.error('Erros no upload:', { uploadErrors, insertErrors })
          toast.error('Algumas imagens não foram salvas')
        } else {
          toast.success('Imagens enviadas com sucesso!')
        }
      }

      setFormData(initialProduct)
      setFiles([])
      setSelectedProduct(null)
      setIsDialogOpen(false)
      loadProducts()
    } catch (error) {
      console.error('Erro ao salvar produto:', error)
      toast.error('Erro ao salvar produto')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (productId: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId)

      if (error) throw error

      toast.success('Produto excluído com sucesso!')
      loadProducts()
    } catch (error) {
      console.error('Erro ao excluir produto:', error)
      toast.error('Erro ao excluir produto')
    }
  }

  const handleDeleteImage = async (imageId: string, productId: string) => {
    try {
      const { error } = await supabase
        .from('product_images')
        .delete()
        .eq('id', imageId)

      if (error) throw error

      toast.success('Imagem excluída com sucesso!')
      loadProductImages([productId])
    } catch (error) {
      console.error('Erro ao excluir imagem:', error)
      toast.error('Erro ao excluir imagem')
    }
  }

  const openEditDialog = (product: Product) => {
    setSelectedProduct(product)
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price,
      promotional_price: product.promotional_price,
      stock: product.stock,
      category_id: product.category_id,
      store_id: product.store_id,
      sku: product.sku || '',
      pkg_weight: product.pkg_weight,
      pkg_length: product.pkg_length,
      pkg_width: product.pkg_width,
      pkg_height: product.pkg_height,
      product_url: product.product_url || '',
      allows_extras: product.allows_extras,
      need_choices: product.need_choices || false,
      status: product.status,
    })
    setFiles([])
    setIsDialogOpen(true)
  }

  const openCreateDialog = () => {
    setSelectedProduct(null)
    setFormData(initialProduct)
    setFiles([])
    setIsDialogOpen(true)
  }

  const [pendingFiles, setPendingFiles] = useState<Record<string, FileType[]>>(
    {},
  )

  useEffect(() => {
    Object.entries(pendingFiles).forEach(([productId, files]) => {
      if (files.length > 0) {
        ;(async () => {
          const { uploadErrors, insertErrors } = await uploadImages(
            files,
            productId,
          )

          if (uploadErrors || insertErrors) {
            toast.error(`Erro ao enviar imagens para o produto ${productId}`)
          } else {
            toast.success('Imagens enviadas com sucesso!')
            loadProductImages([productId])
            setPendingFiles((prev) => ({ ...prev, [productId]: [] })) // limpa
          }
        })()
      }
    })
  }, [pendingFiles])

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-3xl font-bold">Gerenciar Produtos</h1>
        <Button onClick={openCreateDialog}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Produto
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex flex-col md:flex-row gap-4">
        <Select
          value={storeFilter}
          onValueChange={(value) => setStoreFilter(value)}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filtrar por loja" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as lojas</SelectItem>
            {stores.map((store) => (
              <SelectItem key={store.id} value={store.id}>
                {store.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          placeholder="Pesquisar produto..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-xs"
        />
      </div>

      {/* Tabela de Produtos */}
      <Card>
        <CardHeader>
          <CardTitle>Produtos Cadastrados ({products.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Imagens</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Preço</TableHead>
                  <TableHead>Preço Promo</TableHead>
                  <TableHead>Estoque</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="flex flex-row gap-2 items-start">
                        {/* Uploader controlado */}
                        <FileUploader
                          files={pendingFiles[product.id] ?? []}
                          setFiles={(newFilesOrUpdater) => {
                            setPendingFiles((prev) => ({
                              ...prev,
                              [product.id]:
                                typeof newFilesOrUpdater === 'function'
                                  ? newFilesOrUpdater(prev[product.id] ?? [])
                                  : newFilesOrUpdater,
                            }))
                          }}
                        />

                        {/* Imagens já salvas */}
                        <div className="flex flex-wrap gap-2">
                          {productImages[product.id]?.map((img) => (
                            <div key={img.id} className="relative w-16 h-16">
                              <Image
                                src={img.image_url}
                                alt=""
                                fill
                                className="object-cover rounded"
                              />
                              <button
                                onClick={() =>
                                  handleDeleteImage(img.id, product.id)
                                }
                                className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                              >
                                <X size={12} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="font-medium">
                      {product.name}
                    </TableCell>
                    <TableCell>{product.sku}</TableCell>
                    <TableCell>
                      {product.price ? formatCurrencyBRL(product.price) : '-'}
                    </TableCell>
                    <TableCell>
                      {product.promotional_price ? (
                        <span className="text-green-600">
                          {formatCurrencyBRL(product.promotional_price)}
                        </span>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>{product.stock || 0}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          product.status === 'active' ? 'default' : 'secondary'
                        }
                      >
                        {product.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditDialog(product)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="outline">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Excluir Produto
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja excluir "{product.name}"?
                                Esta ação não pode ser desfeita.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(product.id)}
                              >
                                Excluir
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Dialog para Criar/Editar Produto */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedProduct ? 'Editar Produto' : 'Novo Produto'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>

              {/* <div className="space-y-2">
                <Label htmlFor="sku">SKU</Label>
                <Input
                  id="sku"
                  value={formData.sku}
                  onChange={(e) =>
                    setFormData({ ...formData, sku: e.target.value })
                  }
                />
              </div> */}

              <div className="space-y-2">
                <Label htmlFor="price">Preço</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      price: e.target.value ? Number(e.target.value) : null,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="promotional_price">Preço Promocional</Label>
                <Input
                  id="promotional_price"
                  type="number"
                  step="0.01"
                  value={formData.promotional_price || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      promotional_price: e.target.value
                        ? Number(e.target.value)
                        : null,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="stock">Estoque</Label>
                <Input
                  id="stock"
                  type="number"
                  value={formData.stock || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      stock: e.target.value ? Number(e.target.value) : null,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Categoria *</Label>
                <Select
                  value={formData.category_id}
                  onValueChange={(value) =>
                    setFormData({ ...formData, category_id: value })
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: 'active' | 'inactive') =>
                    setFormData({ ...formData, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Ativo</SelectItem>
                    <SelectItem value="inactive">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* <div className="space-y-2">
                <Label htmlFor="product_url">URL do Produto</Label>
                <Input
                  id="product_url"
                  value={formData.product_url}
                  onChange={(e) =>
                    setFormData({ ...formData, product_url: e.target.value })
                  }
                />
              </div> */}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
              />
            </div>

            {/* Configurações */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Configurações</h3>
              <div className="flex items-center space-x-2">
                <Switch
                  id="allows_extras"
                  checked={formData.allows_extras}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, allows_extras: checked })
                  }
                />
                <Label htmlFor="allows_extras">Permite extras</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="need_choices"
                  checked={formData.need_choices || false}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, need_choices: checked })
                  }
                />
                <Label htmlFor="need_choices">Precisa de escolhas</Label>
              </div>
            </div>

            {/* Upload de Imagens */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Imagens do Produto</h3>
              <FileUploader files={files} setFiles={setFiles} />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading
                  ? 'Salvando...'
                  : selectedProduct
                    ? 'Atualizar'
                    : 'Criar'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog para Ver Imagens */}
      <Dialog
        open={!!viewingImages}
        onOpenChange={() => setViewingImages(null)}
      >
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              Imagens do Produto
              {viewingImages && (
                <span className="font-normal text-muted-foreground">
                  {' - ' + products.find((p) => p.id === viewingImages)?.name}
                </span>
              )}
            </DialogTitle>
          </DialogHeader>

          {viewingImages && productImages[viewingImages] && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {productImages[viewingImages].map((image) => (
                <Card
                  key={image.id}
                  className="relative aspect-square overflow-hidden"
                >
                  <Image
                    src={image.image_url}
                    alt=""
                    fill
                    className="object-cover"
                  />
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="absolute top-2 right-2"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Excluir Imagem</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza que deseja excluir esta imagem? Esta ação
                          não pode ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() =>
                            handleDeleteImage(image.id, viewingImages)
                          }
                        >
                          Excluir
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </Card>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
