export interface ProductGroup {
  "@context": string;
  "@type": string;
  name: string;
  image: string;
  url: string;
  description: string;
  hasVariant: Product[];
}

export interface Product {
  "@type": string;
  sku: string;
  image: string;
  name: string;
  description: string;
  color: string;
  grade: string;
  offers: {
    "@type": string;
    url: string;
    priceCurrency: string;
    price: string;
    Sale_price: string;
    availability: string;
    shippingDetails: {
      "@id": string;
    };
    hasMerchantReturnPolicy: {
      "@id": string;
    };
  };
}

export interface MerchantReturnPolicy {
  "@context": string;
  "@type": string;
  "@id": string;
  applicableCountry: string;
  returnPolicyCategory: string;
  merchantReturnDays: string;
  returnMethod: string;
  returnFees: string;
}

export interface ResponseProductData {
  image: string;
  name: string;
  description: string;
  color: string;
  grade: string;
  offers: {
    url: string;
    Sale_price: string;
  };
}
