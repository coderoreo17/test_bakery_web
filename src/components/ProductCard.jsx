import Link from "next/link";
import AddToCartButton from "./AddToCartButton";
import Image from "next/image";

export default function ProductCard({ product, showDetailsLink = false }) {
  const defaultSize =
    product.sizes?.find((s) => s.isDefault) || product.sizes?.[0];

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition p-3 sm:p-4 flex flex-col relative">
      {!product.inStock && (
        <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-sm font-semibold">
          Out of Stock
        </div>
      )}
      {product.image ? (
        <Image
          src={product.image}
          alt={product.name}
          width={300}
          height={300}
          // loading="lazy"
          // placeholder="blur"
          // blurDataURL="/placeholder.png"
          className="h-32 sm:h-40 md:h-48 w-full object-cover rounded-lg mb-2"
        />
      ) : (
        <div className="h-48 w-full bg-gray-200 rounded-lg mb-2 flex items-center justify-center text-gray-400">
          <span>No image</span>
        </div>
      )}
      <h3 className="font-semibold text-sm sm:text-base md:text-lg mb-1 line-clamp-2">
        {product.name}
        {defaultSize && (
          <span className="text-xs lg:text-sm text-black bg-amber-200 px-0.5 ml-1 rounded">
            ({defaultSize.label})
          </span>
        )}
      </h3>
      {product.price != null ? (
        <p className="text-accent font-bold text-sm sm:text-base mb-2">
          ₹{product.price}
        </p>
      ) : defaultSize ? (
        <p className="text-accent font-bold text-sm sm:text-base mb-2">
          ₹{defaultSize.price}
        </p>
      ) : null}
      {/* {product.sizes?.length > 1 && (
        <p className="text-xs text-gray-500">Multiple sizes available</p>
      )} */}
      <div className="mt-auto space-y-2">
        {showDetailsLink && product._id && (
          <Link
            href={`/shop/${product._id}`}
            className="block text-center border border-primary text-primary py-2 rounded-lg hover:bg-primary hover:text-white transition"
          >
            View Details
          </Link>
        )}

        <AddToCartButton product={product} disabled={!product.inStock} />
      </div>
    </div>
  );
}
