// import React from 'react'
// import Link from 'next/link'

// function TopHeader() {
//   const topHeaderText = "50% off all swim suit this Black Friday -"
//   return (
//     <div className='top-header'>
//       <p className='top-header-text'>{topHeaderText} <Link href="/dashboard"> Shop Now!</Link></p>
//       </div>
//   )
// }

// export default TopHeader

"use client";

import Link from "next/link";
import { useQuery, gql } from "@apollo/client";

const GET_TOP_HEADER = gql`
  query {
    topHeaderSetting {
      text
      link
      isVisible
    }
  }
`;

function TopHeader() {
  const { data, loading } = useQuery(GET_TOP_HEADER);

  if (loading) return null;
  if (!data?.topHeaderSetting?.isVisible) return null;

  const { text, link } = data.topHeaderSetting;

  return (
    <div className="top-header bg-black text-white p-2 text-center">
      <p>
        <Link href={link || "/"}>{text}</Link>
      </p>
    </div>
  );
}

export default TopHeader;
