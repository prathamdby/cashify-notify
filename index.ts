import { config } from "dotenv";
config();

import axios from "axios";
import * as cheerio from "cheerio";

import type {
  Product,
  ProductGroup,
  ResponseProductData,
  MerchantReturnPolicy,
} from "./interfaces";
import { ProductAvailability, ProductGrade } from "./enums";

const main = async () => {
  const cashifyProductUrl = process.env.CASHIFY_PRODUCT_URL;
  if (!cashifyProductUrl) {
    console.error("CASHIFY_PRODUCT_URL is not set in the .env file.");
    return;
  }

  try {
    const response = await axios.get(cashifyProductUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Cache-Control": "no-cache",
      },
    });
    const $ = cheerio.load(response.data);

    const jsonData = $('script[type="application/ld+json"]').text();
    const parsedData: (ProductGroup | MerchantReturnPolicy)[] =
      JSON.parse(jsonData);

    const productData: Product[] = (parsedData[0] as ProductGroup).hasVariant;
    const responseData: ResponseProductData[] = productData
      .filter(
        (p) =>
          p.grade === ProductGrade.Superb &&
          p.offers.availability === ProductAvailability.InStock
      )
      .map((product) => ({
        image: product.image,
        name: product.name,
        description: product.description,
        color: product.color,
        grade: product.grade,
        offers: {
          url: product.offers.url,
          Sale_price: product.offers.Sale_price,
        },
      }));

    const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;
    const telegramChatId = process.env.TELEGRAM_CHAT_ID;
    if (!telegramBotToken || !telegramChatId) {
      console.error(
        "TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID is not set in the .env file."
      );
      return;
    }

    if (responseData.length === 0) {
      await axios.post(
        `https://api.telegram.org/bot${telegramBotToken}/sendMessage`,
        {
          chat_id: telegramChatId,
          text: "No product found with specified filters.",
        }
      );
      return;
    }

    const targetPrice = process.env.CASHIFY_TARGET_PRICE;
    if (!targetPrice) {
      console.error("CASHIFY_TARGET_PRICE is not set in the .env file.");
      return;
    }

    const telegramTargetUsername = process.env.TELEGRAM_TARGET_USERNAME;
    if (!telegramTargetUsername) {
      console.error("TELEGRAM_TARGET_USERNAME is not set in the .env file.");
      return;
    }

    const productMessages = responseData.map((product) => {
      return axios.post(
        `https://api.telegram.org/bot${telegramBotToken}/sendMessage`,
        {
          chat_id: telegramChatId,
          text: `<b>Product Details:</b>\nName: ${
            product.name.split("-")[0]
          }\nGrade: ${product.grade}\nColor: ${product.color}\nDescription: ${
            product.description.split(",")[2]
          }\nPrice: ₹${product.offers.Sale_price}\n<b>Buy Now:</b> <a href="${
            product.offers.url
          }">link</a>`,
          parse_mode: "HTML",
          disable_web_page_preview: true,
        }
      );
    });

    const targetPriceMessages = responseData
      .filter((product) => product.offers.Sale_price === targetPrice)
      .map((product) => {
        return axios.post(
          `https://api.telegram.org/bot${telegramBotToken}/sendMessage`,
          {
            chat_id: telegramChatId,
            text: `@${telegramTargetUsername} Price of <b>${
              product.name.split("-")[0]
            }</b> is equal to the target price of <b>₹${targetPrice}</b>. <a href="${
              product.offers.url
            }">View Product</a>`,
            parse_mode: "HTML",
            disable_web_page_preview: true,
          }
        );
      });

    await Promise.all([...productMessages, ...targetPriceMessages]);

    const discordWebhookUrl = process.env.DISCORD_WEBHOOK_URL;
    if (!discordWebhookUrl) {
      console.error("DISCORD_WEBHOOK_URL is not set in the .env file.");
      return;
    }

    const discordMessages = responseData.map((product) => {
      return axios.post(discordWebhookUrl, {
        content: null,
        embeds: [
          {
            title: "Product Details",
            color: 4245430,
            fields: [
              {
                name: "Name",
                value: product.name.split("-")[0],
              },
              {
                name: "Description",
                value: product.description.split(",")[2],
              },
              {
                name: "Grade",
                value: product.grade,
                inline: true,
              },
              {
                name: "Color",
                value: product.color,
                inline: true,
              },
              {
                name: "Price",
                value: `₹${product.offers.Sale_price}`,
              },
              {
                name: "Buy Now",
                value: `[Link](${product.offers.url})`,
              },
            ],
            footer: {
              text: "Cashify",
            },
            timestamp: new Date().toISOString(),
            image: {
              url: product.image,
            },
          },
        ],
        attachments: [],
      });
    });

    await Promise.all(discordMessages);
  } catch (error) {
    console.error("Failed to fetch the product page:", error);
  }
};

main()
  .then(() => console.log("Program ran successfully"))
  .catch((error) =>
    console.error("An error occurred while running the main function:", error)
  );
