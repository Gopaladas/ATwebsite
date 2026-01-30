const ProgressBar = ({ value }) => {
  return (
    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
      <div
        className="h-2 rounded-full bg-indigo-600 transition-all duration-300"
        style={{ width: `${value}%` }}
      />
    </div>
  );
};

export default ProgressBar;
