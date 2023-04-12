import React, { useState, useEffect } from "react";
import Modal from "react-responsive-modal";
import Image from "next/image";

interface ModalProps {
    onAccept: () => void;
};

const ChromeDownloadModal = (props: ModalProps) => {
    const [isChrome, setIsChrome] = useState<boolean>(false);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(true);

    useEffect(() => {
        const chromeVersion =
            window.navigator.userAgent.match(/Chrome\/([0-9]+)/);
        setIsChrome(chromeVersion && Number(chromeVersion[1]) >= 113);
    }, []);

    const handleModalClose = () => {
        setIsModalOpen(false);
        props.onAccept();
    };

    return (
        <>
            <Modal
                classNames={{
                    modal: "rounded-lg w-1/2 md:w-1/2 xl:w-1/3 2xl:w-1/4 h-1/2 overflow-x-hidden",
                }}
                open={isModalOpen}
                onClose={handleModalClose}
            >
                {isChrome ? (
                    <div className="flex flex-col h-full text-center">
                        <h2>
                            Summize is a demo of laserbeak & rumble, my 2 libraries for running large machine learning models on the web.
                            You can select text and click the "Summarize" button to instantly summarize documents.

                            You can read more about it in my blog post here.
                            <br />
                            On first load, this site performs a 900+MB download.
                            <br />
                            Please press "Yes" to continue.
                        </h2>
                        <button onClick={handleModalClose}>Yes</button>
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
