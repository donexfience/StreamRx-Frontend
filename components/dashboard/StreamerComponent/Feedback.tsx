import React from "react";

const Feedback: React.FC = () => {
  return (
    <div>
      <div className="w-full lg:flex bg-[url('/assets/StreamerDashboard/blueBox.png')] bg-cover  px-20 py-60">
        <div className="lg:w-1/2 px-44 py-28">
          <h1 className="text-white w-[60%] text-2xl">
            With StreamRx, my audience increased by more than 70%. It has
            boosted my sales and visibility on Facebook and YouTube.”
          </h1>
          <h3>Donex Fience</h3>
        </div>
        <div className="lg:w-1/2 px-44">
          <img src="/assets/StreamerDashboard/Feedback.png" />
        </div>
      </div>
    </div>
  );
};

export default Feedback;
