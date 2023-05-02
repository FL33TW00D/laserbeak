import React, { useState, useEffect } from "react";
import Modal from "react-responsive-modal";
import Image from "next/image";

const ChromeDownloadModal = () => {
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
    };

    return (
        <>
            {!isChrome ? (
                <Modal
                    classNames={{
                        modal: "rounded-lg w-1/2 md:w-1/2 xl:w-1/3 2xl:w-1/4 overflow-x-hidden !bg-stone-50",
                    }}
                    open={isModalOpen}
                    onClose={handleModalClose}
                    center
                >
                    <div className="flex flex-col h-full text-center">
                        <Image
                            src="/chrome.png"
                            alt="Chrome is required."
                            width={250}
                            height={250}
                            className="mx-auto pt-4"
                        />
                        <div className="pt-8 text-black">
                            <p>
                                This site requires Chrome version 113 or higher.
                            </p>
                            <p>
                                Please download and use Chrome to access this
                                site.
                            </p>
                        </div>
                    </div>
                </Modal>
            ) : (
                <></>
            )}
        </>
    );
};

export default ChromeDownloadModal;
