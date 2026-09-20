const HomePage = () => {
  return (
    <>
      {/* first section black background */}
      <section className="bg-black w-full h-screen p-20 flex justify-center items-center">
        {/* content */}
        <div className=" text-center">
          <h1 className="text-neutral-200 lowercase hero-title text-4xl mb-2 flex items-center justify-center">
            <span
              className="
    bg-[radial-gradient(circle_at_30%_35%,#ff8cff_0%,#f20065_30%,#7d007f_58%,#0b0d0c_73%)]
    bg-clip-text
    text-transparent
    -translate-y-1
    text-6xl
  "
            >
              @
            </span>
            &nbsp;rafathedev
          </h1>
          <h1 className="text-white uppercase hero-title text-6xl md:text-7xl">
            Frontend Developer
          </h1>
          <p className="text-neutral-00 mt-4 text-2xl">
            I build interactive experiences for the web.
          </p>
        </div>
      </section>
    </>
  );
};

export default HomePage;
