import React from "react";
import { Detail } from "./Detail";
import ClampLines from "react-clamp-lines";
import Clamp from "react-multiline-clamp";
interface Props {
  title: string;
  desc: string;
  price: string | number;
  onSale: boolean;
  total_ratings: number;
  avg_rating: number;
}

export const Card = ({
  title,
  desc,
  price,
  onSale,
  total_ratings,
  avg_rating,
}: Props) => {
  avg_rating = Math.round((avg_rating + Number.EPSILON) * 100) / 100;
  return (
    <div className="flex flex-col justify-between w-full h-full max-w-lg transition duration-1000 p-7 dark:bg-white bg-white-pure ">
      <div>
        {/* <ClampLines lines={2}>
          <h1 className="pb-1 font-bold text-black-lighter ">{title}</h1>
        </ClampLines> */}
        <ClampLines
          text={title}
          id="title"
          lines={3}
          innerElement="h1"
          className="pb-1 font-bold text-black-lighter"
        />
        <hr />
        {/* {desc && (
          <ClampLines
            text={desc}
            id="desc"
            lines={3}
            buttons={false}
            innerElement="p"
            className="pt-2 text-sm text-gray-400 pb-7 "
          />
        )} */}
        <p className="pt-2 overflow-hidden text-sm text-gray-400 pb-7">
          <Clamp lines={3}>{desc}</Clamp>
        </p>
      </div>
      <div className="grid grid-flow-col auto-cols-fr -mb-7 -mx-7 bg-primary top-full">
        <Detail title="Price" content={"P" + price} />
        <Detail
          title="Rating"
          content={avg_rating}
          borderLeft
          borderRightOnMobile={true}
        />
        <Detail
          title="Sold"
          content={total_ratings}
          borderLeft
          borderRight
          dontShowOnMobile
        />
        <Detail title="On Sale" content={onSale ? "Yes" : "No"} />
      </div>
    </div>
  );
};
