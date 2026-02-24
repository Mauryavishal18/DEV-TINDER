const PortfolioModal = ({ url, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/70 flex justify-center items-center">
      <div className="bg-slate-900 p-6 rounded-xl w-4/5 h-4/5">
        <button onClick={onClose} className="text-white mb-3">
          Close
        </button>
        <iframe src={url} className="w-full h-full rounded-lg" />
      </div>
    </div>
  );
};

export default PortfolioModal;