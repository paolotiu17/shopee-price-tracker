import { GetServerSideProps } from "next";
import React, { useEffect } from "react";
import { Button } from "components/General/Button";
import Layout from "components/Layout";
import { MainContent } from "components/MainContent/MainContent";
import ClampLines from "react-clamp-lines";
import Modal from "react-modal";
import { getItem, getOneUserItem, Item } from "utils/api";
import { apiHandler } from "utils/apiHandler";
import { useIsMobile } from "utils/useIsMobile";
import { Option } from "components/General/Option";
import dynamic from "next/dynamic";

export const getServerSideProps: GetServerSideProps<Props> = async ({
  params,
  req,
}) => {
  const { id } = params!;

  if (typeof id === "string") {
    // Try to see if user is logged in
    const { data: userItemData, error } = await apiHandler(
      getOneUserItem(id, req.headers.cookie)
    );

    if (error) {
      const { data } = await apiHandler(getItem(id));
      if (data) {
        // logged out if 401 --- logged in if 400
        if (error?.code === 401) {
          return {
            props: {
              data,
              isLoggedIn: false,
            },
          };
        } else if (error.code === 400) {
          return {
            props: {
              data,
              isLoggedIn: true,
            },
          };
        }
      }
    }

    if (error?.code === 400) {
      return {
        redirect: {
          permanent: false,
          destination: "/home",
        },
      };
    } else if (userItemData) {
      return {
        redirect: {
          destination: "/home/item/" + id,
          permanent: false,
        },
      };
    }
  }
  // Catch all
  return {
    redirect: {
      permanent: false,
      destination: "/",
    },
  };
};

interface Props {
  data: Item;
  isLoggedIn: boolean;
}
Modal.setAppElement("#__next");

const PriceChart = dynamic(() => import("components/Charts/PriceChart"));
const ItemDetails = dynamic(
  () => import("components/ItemDetail/ItemDetailContainer")
);
export const ItemInfo = ({ data, isLoggedIn }: Props) => {
  const item = data.item;
  const isMobile = useIsMobile();

  useEffect(() => {
    const btn = document.querySelector(".clamp-lines__button");
    if (btn) {
      btn.classList.add(
        "text-gray-400",
        "dark:text-gray-300",
        "transition",
        "duration-1000"
      );
    }
  }, []);
  return (
    <Layout title={item?.name} showLogo={!isLoggedIn} showLogin={!isLoggedIn}>
      <MainContent showBackground={!isMobile}>
        <div className="flex justify-center px-3 sm:px-8 ">
          <div className="flex flex-col justify-between w-full max-w-screen-md pb-10">
            <div>
              <div className="flex justify-between">
                <h1 className="text-2xl font-bold">{item?.name}</h1>
                <Option id={item.itemID} hasDelete={false} />
              </div>
              {item?.description && (
                <ClampLines
                  text={item?.description}
                  id={"description-" + item.itemID}
                  lines={3}
                  innerElement="p"
                  className="py-4 mt-3 text-sm leading-7 whitespace-pre-wrap"
                />
              )}
            </div>
            <hr />

            <ItemDetails item={data} />
            <hr />
            <PriceChart data={item.all_prices} />
            <div className="grid gap-2 py-10 font-bold ">
              <p>
                Current Price:{"  "}
                <span className="text-primary">P{item?.price}</span>
              </p>
              <p>
                Lowest Price:{"  "}
                <span className="text-accent">P{item?.lowest_price}</span>
              </p>
            </div>
            <div className="flex justify-end w-full">
              <a href={item?.urls[0]} target="_blank">
                <Button aria-label="Visit shop" accent>
                  Visit Shop
                </Button>
              </a>
            </div>
          </div>
        </div>
      </MainContent>
    </Layout>
  );
};

export default ItemInfo;
