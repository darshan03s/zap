const Preview = ({ url }: { url: string }) => {
    return (
        <>
            {url ?
                <iframe
                    src={url}
                    className='w-full h-full'
                ></iframe> : null}
        </>
    )
}

export default Preview