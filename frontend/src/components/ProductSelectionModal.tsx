import React, { useState, useEffect } from 'react';
import type { Product } from '../services/products';

interface ProductSelectionModalProps {
  isOpen: boolean;
  products: Product[];
  selectedProductIds: number[];
  onClose: () => void;
  onConfirm: (selectedIds: number[]) => void;
  title?: string;
}

const ProductSelectionModal: React.FC<ProductSelectionModalProps> = ({
  isOpen,
  products,
  selectedProductIds,
  onClose,
  onConfirm,
  title = 'Seleccionar productos',
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [localSelectedIds, setLocalSelectedIds] = useState<number[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

  // Inicializar los IDs seleccionados cuando el modal se abre
  useEffect(() => {
    if (isOpen) {
      setLocalSelectedIds([...selectedProductIds]);
    }
  }, [isOpen, selectedProductIds]);

  // Filtrar productos según el término de búsqueda
  useEffect(() => {
    if (!isOpen) return;
    
    const filtered = searchTerm
      ? products.filter(
          (product) =>
            product.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.id.toString().includes(searchTerm)
        )
      : [...products];
    
    setFilteredProducts(filtered);
  }, [searchTerm, products, isOpen]);

  const toggleProduct = (productId: number) => {
    setLocalSelectedIds((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const handleConfirm = () => {
    onConfirm(localSelectedIds);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div 
        className="w-full max-w-2xl max-h-[80vh] flex flex-col bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">{title}</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          
          <div className="mt-3 relative">
            <input
              type="text"
              placeholder="Buscar productos..."
              className="w-full px-4 py-2 pl-10 text-sm rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className="absolute left-3 top-2.5 text-gray-400">
              <span className="material-symbols-outlined text-lg">search</span>
            </span>
          </div>
          
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            {localSelectedIds.length} {localSelectedIds.length === 1 ? 'producto seleccionado' : 'productos seleccionados'}
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No se encontraron productos que coincidan con la búsqueda.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className={`flex items-start p-3 rounded-lg cursor-pointer transition-colors ${
                    localSelectedIds.includes(product.id)
                      ? 'bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700/50 border border-transparent'
                  }`}
                  onClick={() => toggleProduct(product.id)}
                >
                  <div className="flex-shrink-0 h-10 w-10 rounded-md bg-gray-100 dark:bg-gray-700 flex items-center justify-center mr-3">
                    {product.imagen_principal ? (
                      <img
                        src={product.imagen_principal}
                        alt={product.nombre}
                        className="h-full w-full object-cover rounded-md"
                      />
                    ) : (
                      <span className="text-gray-400">
                        <span className="material-symbols-outlined">image</span>
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {product.nombre}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      ID: {product.id} • {product.categoria}
                    </p>
                    <p className="text-sm font-semibold text-primary-600 dark:text-primary-400 mt-1">
                      S/ {parseFloat(product.precio).toFixed(2)}
                    </p>
                  </div>
                  <div className="ml-2 flex-shrink-0">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                      localSelectedIds.includes(product.id)
                        ? 'bg-primary-500 text-white'
                        : 'border-2 border-gray-300 dark:border-gray-600'
                    }`}>
                      {localSelectedIds.includes(product.id) && (
                        <span className="material-symbols-outlined text-sm">check</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg disabled:opacity-50"
            disabled={localSelectedIds.length === 0}
          >
            Confirmar ({localSelectedIds.length})
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductSelectionModal;
