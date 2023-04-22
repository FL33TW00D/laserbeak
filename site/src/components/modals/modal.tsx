import React, { useState, useEffect } from "react";
import Modal from "react-responsive-modal";
import Image from "next/image";

interface ModalProps {
    onAccept: () => void;
}

const ChromeDownloadModal = (props: ModalProps) => {
    const [isChrome, setIsChrome] = useState<boolean>(false);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(true);

    useEffect(() => {
        const chromeVersion =
            window.navigator.userAgent.match(/Chrome\/([0-9]+)/);
        if (!chromeVersion) {
            return;
        }
        setIsChrome(chromeVersion && Number(chromeVersion[1]) >= 113);
    }, []);

    const handleModalClose = () => {
        setIsModalOpen(false);
        if (isChrome) {
            props.onAccept();
        }
    };

    return (
        <>
            <Modal
                classNames={{
                    modal: "rounded-lg w-1/2 md:w-1/2 xl:w-1/3 2xl:w-1/4 h-3/4 md:h-2/3 2xl:h-1/2 overflow-x-hidden",
                }}
                open={isModalOpen}
                onClose={handleModalClose}
            >
                {isChrome ? (
                    <div className="flex h-full w-full flex-col text-center items-center justify-center prose p-4">
                        <h2 className="text-2xl font-bold pb-4">
                            Welcome to Summize!
                        </h2>
                        <p>
                            Summize is a local AI powered document editor. Try
                            out our summarization and translation features!
                        </p>
                        <p>
                            When you press continue, this site performs a 900MB
                            download. Please be patient.
                        </p>
                        <div className="flex flex-row gap-x-2">
                            <button
                                onClick={handleModalClose}
                                className="hover group mb-2 inline-flex max-w-xs items-center rounded-lg border py-3 px-4 text-lg shadow-sm duration-150"
                            >
                                Continue
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="ml-2 h-8 w-8 transform duration-200 group-hover:translate-x-0.5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={1}
                                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col h-full text-center">
                        <Image
                            src="/chrome.png"
                            alt="Picture of the author"
                            width={250}
                            height={250}
                            className="mx-auto pt-4"
                        />
                        <div className="pt-8">
                            <p>
                                This site requires Chrome version 113 or higher.
                            </p>
                            <p>
                                Please download and use Chrome to access this
                                site.
                            </p>
                        </div>
                    </div>
                )}
            </Modal>
        </>
    );
};

export default ChromeDownloadModal;
