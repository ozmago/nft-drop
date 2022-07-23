import {
  ChainId,
  useClaimedNFTSupply,
  useContractMetadata,
  useNetwork,
  useNFTDrop,
  useUnclaimedNFTSupply,
  useActiveClaimCondition,
  useClaimNFT,
  useWalletConnect,
  useCoinbaseWallet,
} from "@thirdweb-dev/react";
import { useNetworkMismatch } from "@thirdweb-dev/react";
import { useAddress, useMetamask } from "@thirdweb-dev/react";
import { formatUnits, parseUnits } from "ethers/lib/utils";
import type { NextPage } from "next";
import { useState } from "react";
import styles from "../styles/Theme.module.css";
import Footer from "../components/Footer";

// Put Your NFT Drop Contract address from the dashboard here
const myNftDropContractAddress = "0xa73657b8DfC5a5538d57847B2E16d18127fDE2bb";

const Home: NextPage = () => {
  const nftDrop = useNFTDrop(myNftDropContractAddress);
  const address = useAddress();
  const connectWithMetamask = useMetamask();
  const connectWithWalletConnect = useWalletConnect();
  const connectWithCoinbaseWallet = useCoinbaseWallet();
  const isOnWrongNetwork = useNetworkMismatch();
  const claimNFT = useClaimNFT(nftDrop);
  const [, switchNetwork] = useNetwork();

  // The amount the user claims
  const [quantity, setQuantity] = useState(1); // default to 1

  // Load contract metadata
  const { data: contractMetadata } = useContractMetadata(
    myNftDropContractAddress
  );

  // Load claimed supply and unclaimed supply
  const { data: unclaimedSupply } = useUnclaimedNFTSupply(nftDrop);
  const { data: claimedSupply } = useClaimedNFTSupply(nftDrop);

  // Load the active claim condition
  const { data: activeClaimCondition } = useActiveClaimCondition(nftDrop);

  // Check if there's NFTs left on the active claim phase
  const isNotReady =
    activeClaimCondition &&
    parseInt(activeClaimCondition?.availableSupply) === 0;

  // Check if there's any NFTs left
  const isSoldOut = unclaimedSupply?.toNumber() === 0;

  // Check price
  const price = parseUnits(
    activeClaimCondition?.currencyMetadata.displayValue || "0",
    activeClaimCondition?.currencyMetadata.decimals
  );

  // Multiply depending on quantity
  const priceToMint = price.mul(quantity);

  // Loading state while we fetch the metadata
  if (!nftDrop || !contractMetadata) {
    return <div className={styles.container}>Loading...</div>;
  }

  // Function to mint/claim an NFT
  const mint = async () => {
    if (isOnWrongNetwork) {
      switchNetwork && switchNetwork(ChainId.Mumbai);
      return;
    }

    claimNFT.mutate(
      { to: address as string, quantity },
      {
        onSuccess: () => {
          alert(`Successfully minted NFT${quantity > 1 ? "s" : ""}!`);
        },
        onError: (err: any) => {
          console.error(err);
          alert(err?.message || "Something went wrong");
        },
      }
    );
  };

  return (
    <div className="bg-indigo-900 w-full">
      <div className="bg-[url('/hero.png')] bg-cover bg-no-repeat">
        <div className="flex justify-center items-center gap-24 p-24">
          <h1 className="text-7xl font-mono">Moonclaws</h1>
        </div>
        <div className="flex flex-row flex-wrap items-center justify-center gap-32">
          <div className="">
            {/* Title of your NFT Collection */}
            <h1 className="text-xl font-semibold">{contractMetadata?.name}</h1>
            {/* Description of your NFT Collection */}
            <p className={styles.description}>
              {contractMetadata?.description}
            </p>
          </div>

          <div className={styles.imageSide}>
            {/* Image Preview of NFTs */}
            <img
              className={styles.image}
              src={contractMetadata?.image}
              alt={`${contractMetadata?.name} preview image`}
            />

            {/* Amount claimed so far */}
            <div className={styles.mintCompletionArea}>
              <div className={styles.mintAreaLeft}>
                <p>Total Minted</p>
              </div>
              <div className={styles.mintAreaRight}>
                {claimedSupply && unclaimedSupply ? (
                  <p>
                    {/* Claimed supply so far */}
                    <b>{claimedSupply?.toNumber()}</b>
                    {" / "}
                    {
                      // Add unclaimed and claimed supply to get the total supply
                      claimedSupply?.toNumber() + unclaimedSupply?.toNumber()
                    }
                  </p>
                ) : (
                  // Show loading state if we're still loading the supply
                  <p>Loading...</p>
                )}
              </div>
            </div>

            {/* Show claim button or connect wallet button */}
            {address ? (
              // Sold out or show the claim button
              isSoldOut ? (
                <div>
                  <h2>Sold Out</h2>
                </div>
              ) : isNotReady ? (
                <div>
                  <h2>Not ready to be minted yet</h2>
                </div>
              ) : (
                <>
                  <p>Quantity</p>
                  <div className={styles.quantityContainer}>
                    <button
                      className={`${styles.quantityControlButton}`}
                      onClick={() => setQuantity(quantity - 1)}
                      disabled={quantity <= 1}
                    >
                      -
                    </button>

                    <h4>{quantity}</h4>

                    <button
                      className={`${styles.quantityControlButton}`}
                      onClick={() => setQuantity(quantity + 1)}
                      disabled={
                        quantity >=
                        parseInt(
                          activeClaimCondition?.quantityLimitPerTransaction ||
                            "0"
                        )
                      }
                    >
                      +
                    </button>
                  </div>

                  <button
                    className={`${styles.mainButton} ${styles.spacerTop} ${styles.spacerBottom}`}
                    onClick={mint}
                    disabled={claimNFT.isLoading}
                  >
                    {claimNFT.isLoading
                      ? "Minting..."
                      : `Mint${quantity > 1 ? ` ${quantity}` : ""}${
                          activeClaimCondition?.price.eq(0)
                            ? " (Free)"
                            : activeClaimCondition?.currencyMetadata
                                .displayValue
                            ? ` (${formatUnits(
                                priceToMint,
                                activeClaimCondition.currencyMetadata.decimals
                              )} ${
                                activeClaimCondition?.currencyMetadata.symbol
                              })`
                            : ""
                        }`}
                  </button>
                </>
              )
            ) : (
              <div className={styles.buttons}>
                <button
                  className={styles.mainButton}
                  onClick={connectWithMetamask}
                >
                  Connect MetaMask
                </button>
                <button
                  className={styles.mainButton}
                  onClick={connectWithWalletConnect}
                >
                  Connect with Wallet Connect
                </button>
                <button
                  className={styles.mainButton}
                  onClick={connectWithCoinbaseWallet}
                >
                  Connect with Coinbase Wallet
                </button>
              </div>
            )}
          </div>
        </div>
        {/* Powered by thirdweb */}{" "}
        {/*       <img
        src="/logo.png"
        alt="thirdweb Logo"
        width={135}
        className={styles.buttonGapTop}
      /> */}
      </div>
      {/* About section */}

      <div className="flex flex-wrap justify-center items-center gap-24 p-24">
        <div className="w-96">
          <img className="h-full w-full" src="/article1.png" />
        </div>
        <ul className="flex flex-col gap-4">
          <li className="font-bold list-disc">10,000 initial supply</li>
          <li className="font-bold list-disc">10,000 initial supply</li>
          <li className="font-bold list-disc">10,000 initial supply</li>
          <li className="font-bold list-disc">10,000 initial supply</li>
          <li className="font-bold list-disc ">10,000 initial supply</li>
        </ul>
      </div>

      {/* More Info */}

      <div className="flex flex-wrap justify-center items-center gap-24 p-24">
        <div className="flex flex-col gap-10">
          <h2 className="text-3xl font-bold ">
            The Moonrunners are taking over
          </h2>
          <p className="max-w-md">
            A collection of 10,000 handcrafted PFPs. For the longest time, this
            Wolfpack lived in harmony and peace on Primordia among humankind,
            but one month would change the course of history forever and now the
            Crimson full moon is coming once again...
          </p>
        </div>
        <div className="w-96">
          <img className="h-full w-full" src="/article1.png" />
        </div>
      </div>

      {/* FAQs */}
      <h2 className="text-3xl font-bold mb-16">FAQs</h2>
      <div className="flex justify-center">
        <div className="flex flex-row flex-wrap gap-24 justify-center">
          <div className="max-w-md flex flex-col gap-10">
            <div>
              <h3 className="font-bold text-lg text-left mb-4">
                Is there a Discord?
              </h3>
              <p className="text-left">
                No, we are a Twitter focused project. We wanted to cut out the
                noise and need to go to Discord to stay up to date.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-lg text-left">
                Is there a Discord?
              </h3>
              <p className="text-left">
                No, we are a Twitter focused project. We wanted to cut out the
                noise and need to go to Discord to stay up to date.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-lg text-left">
                Is there a Discord?
              </h3>
              <p className="text-left">
                No, we are a Twitter focused project. We wanted to cut out the
                noise and need to go to Discord to stay up to date.
              </p>
            </div>
          </div>
          <div className="max-w-md">
            <h3 className="font-bold text-lg">Is there a Discord?</h3>
            <p>
              No, we are a Twitter focused project. We wanted to cut out the
              noise and need to go to Discord to stay up to date.
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Home;
