import { GetServerSideProps } from "next";
import Peso from "public/peso.svg";
import Question from "public/question.svg";
import React, { useEffect, useRef, useState } from "react";
import { Button } from "components/General/Button";
import Layout from "components/Layout";
import { MainContent } from "components/MainContent/MainContent";
import ClampLines from "react-clamp-lines";
import Modal from "react-modal";
import tw from "twin.macro";
import { addPriceTarget, getOneUserItem, Item } from "../../../utils/api";
import { apiHandler } from "utils/apiHandler";
import toast from "react-hot-toast";
import { useIsMobile } from "utils/useIsMobile";
import { Tooltip } from "components/General/Tooltip";
import { Option } from "components/General/Option";
import dynamic from "next/dynamic";
export const getServerSideProps: GetServerSideProps = async ({
  params,
  req,
}) => {
  const { id } = params!;

  if (typeof id === "string") {
    const { data, error } = await apiHandler(
      getOneUserItem(id, req.headers.cookie)
    );
    if (error?.code === 400) {
      return {
        redirect: {
          permanent: false,
          destination: "/home",
        },
      };
    } else if (data) {
      return {
        props: {
          data,
        },
      };
    }
  }

  return {
    redirect: {
      permanent: false,
      destination: "/login",
    },
  };
};

const customStyles: ReactModal.Styles = {
  content: {
    top: "35%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
  },
  overlay: {
    backgroundColor: "rgba(43, 43, 43, 0.405)",
  },
};

interface Props {
  id: string;
  data: Item;
}
Modal.setAppElement("#__next");
const PriceChart = dynamic(() => import("components/Charts/PriceChart"));
const ItemDetails = dynamic(
  () => import("components/ItemDetail/ItemDetailContainer")
);
export const ItemInfo = ({ data }: Props) => {
  const item = data.item;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [target, setTarget] = useState(data?.target || 0);
  const isMobile = useIsMobile();
  const inputRef = useRef<HTMLInputElement>(null);

  function closeModal() {
    setIsModalOpen(false);
  }
  const addTarget = async (target: number) => {
    if (item) {
      const { error } = await apiHandler(addPriceTarget(item._id, target));
      if (error) {
        toast.error("There was an error in setting the price target");
        setTarget(0);
      } else {
        toast.success("Price target updated");
      }
    }
  };

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
    setTarget(data?.target || 0);
  }, []);
  return (
    <Layout title={item?.name} showLogo={false} showLogin={false}>
      <MainContent showBackground={!isMobile}>
        <div className="flex justify-center px-3 sm:px-8 ">
          <div className="flex flex-col justify-between w-full max-w-screen-md pb-10">
            <div>
              <div className="flex justify-between">
                <h1 className="text-2xl font-bold">{item?.name}</h1>
                <Option id={item.itemID} />
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
            <div className="my-4 text-center">
              {/* <h3 className="text-lg">Price History</h3> */}
              <PriceChart data={item.all_prices} />
            </div>
            <hr />
            <ItemDetails item={data} />
            <hr />
            <div className="grid gap-2 py-10 font-bold ">
              <p>
                Current Price:{"  "}
                <span className="text-primary">P{item?.price}</span>
              </p>
              <p>
                Lowest Price:{"  "}
                <span className="text-accent">P{item?.lowest_price}</span>
              </p>
              <p
                css={[
                  tw`relative transition duration-1000 max-w-min whitespace-nowrap`,
                  target ? tw`text-black dark:text-white` : tw`text-gray-400`,
                ]}
              >
                Price Target:{" "}
                {target ? (
                  <span className="text-green-300"> P{target} </span>
                ) : (
                  ""
                )}
                <Tooltip
                  text={"Get alerted when this item reaches your price target!"}
                >
                  <Question
                    className="absolute w-3 cursor-pointer fill-current -top-1 -right-4"
                    style={{ color: "inherit" }}
                  />
                </Tooltip>
                {/* <span
                  onMouseOver={() => (isMobile ? "" : setIsTooltipHover(true))}
                  onMouseLeave={() => setIsTooltipHover(false)}
                  onClick={() => setIsTooltipHover(!isTooltipHover)}
                >
                  <Question
                    className="absolute w-3 cursor-pointer fill-current -top-1 -right-4"
                    style={{ color: "inherit" }}
                  />
                </span>
                <span
                  className={`absolute h-auto p-2 text-xs font-normal text-white break-words whitespace-normal transform translate-x-full -translate-y-full rounded bg-black-lighter w-28 -top-1 -right-4 bg-opacity-70 ${
                    isTooltipHover ? "block" : "hidden"
                  }`}
                >
                  Get alerted when this item reaches your price target!
                </span> */}
              </p>
            </div>
            <div className="flex justify-between w-full">
              <Button
                accent
                filled
                onClick={() => setIsModalOpen(true)}
                aria-label="add price target"
              >
                Add A Target
              </Button>
              <a href={item?.urls[0]} target="_blank">
                <Button aria-label="Visit shop" accent>
                  Visit Shop
                </Button>
              </a>
            </div>
          </div>
        </div>
        <Modal
          isOpen={isModalOpen}
          onRequestClose={closeModal}
          style={customStyles}
        >
          <form
            action="#"
            onSubmit={(e) => {
              e.preventDefault();
              if (inputRef.current) {
                const target = parseInt(inputRef.current.value);
                setTarget(target);
                addTarget(target);
              }
              closeModal();
            }}
            className="flex items-center"
          >
            <span className="inline-flex items-center py-1 pl-3 pr-1 text-sm text-gray-500 bg-white border-t border-b border-l border-gray-300 shadow-sm rounded-l-md">
              <Peso
                width="14px"
                height="16px"
                className="text-gray-500 fill-current "
              />
            </span>
            <input
              ref={inputRef}
              type="number"
              min={1}
              max={item?.price ? item.price - 1 : ""}
              className="pl-1 text-black outline-none focus:ring-1 focus:ring-primary"
              defaultValue={target}
            />
            <Button
              type="submit"
              className="py-1 ml-5 mr-3text-base h-9 dark:bg-primary"
            >
              Add Target
            </Button>
          </form>
        </Modal>
      </MainContent>
    </Layout>
  );
};

export default ItemInfo;
