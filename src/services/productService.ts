import { Product, ProductPack, ProductComparisonFeature } from '../types';
import { PRODUCTS, PRODUCT_PACKS, COMPARISON_FEATURES, getProductBySlug } from '../data/products';

/**
 * SERVICIO DE PRODUCTOS TAPRD
 * Centraliza la consulta de productos físicos NFC, packs y especificaciones.
 * Preparado para consultar catálogo dinámico desde Firestore en el futuro.
 */

export async function fetchAllProducts(): Promise<Product[]> {
  return PRODUCTS;
}

export async function fetchProductBySlug(slug: string): Promise<Product | undefined> {
  return getProductBySlug(slug);
}

export async function fetchProductPacks(): Promise<ProductPack[]> {
  return PRODUCT_PACKS;
}

export async function fetchComparisonFeatures(): Promise<ProductComparisonFeature[]> {
  return COMPARISON_FEATURES;
}
