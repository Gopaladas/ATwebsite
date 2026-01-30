const ProgressBar = ({ value }) => {
  return (
    <div className="w-full mt-2">
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="h-2 rounded-full bg-indigo-600 transition-all duration-300"
          style={{ width: `${value}%` }}
        />
      </div>
      <p className="text-xs text-gray-600 mt-1">{value}% completed</p>
    </div>
  );
};

export default ProgressBar;
