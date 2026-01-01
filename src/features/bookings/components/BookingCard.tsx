import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  // ✅ 修正這裡：faPlaneArrival (原本是 faplaneArrival)
  faTrashCan, faPen, faPlane, faHotel, faTicket, faSuitcaseRolling, faArrowRight, faMapMarkerAlt, faPlaneArrival, faPlaneDeparture
} from '@fortawesome/free-solid-svg-icons';

export interface BookingItem {
  id: string;
  type: 'flight' | 'hotel' | 'activity';
  title: string;
  provider?: string;
  date: string;
  time?: string; // 這通常指「出發時間」或「入住時間」
  reference?: string;
  link?: string;
  // 機票專屬
  departCode?: string;
  departName?: string;
  arriveCode?: string;
  arriveName?: string;
  arriveTime?: string; // ✅ 新增：抵達時間
  baggage?: string;
  // 住宿專屬
  checkOutDate?: string;
  address?: string;
  image?: string;
}

interface BookingCardProps {
  item: BookingItem;
  onEdit: (item: BookingItem) => void;
  onDelete: (id: string) => void;
}

export const BookingCard = ({ item, onEdit, onDelete }: BookingCardProps) => {
  
  // ✈️ 機票卡片
  if (item.type === 'flight') {
    return (
      <div className="bg-white rounded-2xl shadow-sm border-2 border-[#F2F4E7] overflow-hidden group relative">
        <div className="bg-[#5C4033] px-4 py-2 flex justify-between items-center text-white">
          <div className="flex items-center space-x-2">
            <FontAwesomeIcon icon={faPlane} className="text-xs opacity-70" />
            <span className="font-bold text-sm">{item.provider}</span>
            <span className="font-mono text-xs opacity-70 truncate max-w-[150px]">{item.title}</span>
          </div>
          {item.reference && (
            <div className="text-xs font-mono bg-white/20 px-2 py-0.5 rounded text-orange-100 whitespace-nowrap">
              Ref: {item.reference}
            </div>
          )}
        </div>

        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            {/* 出發 */}
            <div className="text-center flex-1">
              <div className="text-2xl font-black text-[#5E5340]">{item.departCode}</div>
              <div className="text-[10px] text-gray-400 font-bold truncate">{item.departName}</div>
            </div>

            {/* 中間連接 */}
            <div className="flex flex-col items-center justify-center px-2 flex-[1.5]">
              <div className="text-[10px] font-bold text-gray-400 mb-1 font-mono">{item.date}</div>
              <div className="flex items-center w-full space-x-2">
                <div className="h-[2px] bg-gray-200 flex-1 relative">
                  <div className="absolute right-0 -top-1 w-1 h-1 rounded-full bg-gray-300"></div>
                </div>
                <FontAwesomeIcon icon={faPlane} className="text-[#3AA986] text-lg transform rotate-45" />
                <div className="h-[2px] bg-gray-200 flex-1 relative">
                  <div className="absolute left-0 -top-1 w-1 h-1 rounded-full bg-gray-300"></div>
                </div>
              </div>
              {item.baggage && (
                <div className="mt-1 flex items-center text-[10px] text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full whitespace-nowrap">
                  <FontAwesomeIcon icon={faSuitcaseRolling} className="mr-1" />
                  {item.baggage}
                </div>
              )}
            </div>

            {/* 抵達 */}
            <div className="text-center flex-1">
              <div className="text-2xl font-black text-[#5E5340]">{item.arriveCode}</div>
              <div className="text-[10px] text-gray-400 font-bold truncate">{item.arriveName}</div>
            </div>
          </div>

          {/* ✅ 時間顯示區塊 */}
          <div className="flex justify-between bg-[#F9FAFB] p-2 rounded-xl">
            <div className="text-center flex-1">
                <div className="text-xs text-gray-400 mb-1"><FontAwesomeIcon icon={faPlaneDeparture} className="mr-1"/>出發時間</div>
                <div className="text-lg font-black text-[#5C4033]">{item.time || '--:--'}</div>
            </div>
            <div className="w-[1px] bg-gray-200 mx-2"></div>
            <div className="text-center flex-1">
                <div className="text-xs text-gray-400 mb-1"><FontAwesomeIcon icon={faPlaneArrival} className="mr-1"/>抵達時間</div>
                <div className="text-lg font-black text-[#5C4033]">{item.arriveTime || '--:--'}</div>
            </div>
          </div>
        </div>

        <div className="absolute top-2 right-2 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onEdit(item)} className="p-1.5 bg-white/90 rounded-full text-blue-400 shadow-sm hover:scale-110 transition-transform">
            <FontAwesomeIcon icon={faPen} className="text-xs" />
          </button>
          <button onClick={() => onDelete(item.id)} className="p-1.5 bg-white/90 rounded-full text-red-400 shadow-sm hover:scale-110 transition-transform">
            <FontAwesomeIcon icon={faTrashCan} className="text-xs" />
          </button>
        </div>
      </div>
    );
  }

  // 🏨 住宿/活動卡片 (保持不變)
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border-2 border-[#F2F4E7] flex group relative overflow-hidden">
      {item.image && (
        <div className="w-24 h-24 rounded-xl overflow-hidden mr-4 flex-shrink-0 border border-gray-100 shadow-inner">
          <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2 mb-1">
          <span className={`text-xs font-bold px-2 py-0.5 rounded text-white ${item.type === 'hotel' ? 'bg-indigo-400' : 'bg-green-500'} whitespace-nowrap`}>
            <FontAwesomeIcon icon={item.type === 'hotel' ? faHotel : faTicket} className="mr-1" />
            {item.type === 'hotel' ? '住宿' : '票券'}
          </span>
          <span className="text-[10px] text-gray-400 font-bold truncate">{item.provider}</span>
        </div>
        <h3 className="font-black text-[#5E5340] text-lg mb-1 truncate leading-tight">{item.title}</h3>
        <div className="text-xs font-bold text-gray-500 flex items-center flex-wrap gap-2 mb-1">
          <span className="bg-gray-50 px-2 py-1 rounded border border-gray-100 whitespace-nowrap">{item.date} {item.time}</span>
          {item.checkOutDate && (
            <>
              <FontAwesomeIcon icon={faArrowRight} className="text-[10px] text-gray-300" />
              <span className="bg-gray-50 px-2 py-1 rounded border border-gray-100 whitespace-nowrap">{item.checkOutDate}</span>
            </>
          )}
        </div>
        {item.address && (
          <div className="text-[10px] text-gray-400 flex items-center truncate max-w-full">
            <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-1 opacity-50 flex-shrink-0" />
            <span className="truncate">{item.address}</span>
          </div>
        )}
        {item.reference && (
          <div className="mt-2 text-xs font-mono text-gray-400 truncate">
            訂單：<span className="select-all bg-yellow-50 px-1 rounded border border-yellow-100 text-yellow-700">{item.reference}</span>
          </div>
        )}
      </div>
      {item.link && (
        <a href={item.link} target="_blank" rel="noreferrer" className="ml-3 self-start px-3 py-2 bg-[#F2F4E7] text-[#5C4033] rounded-xl text-xs font-bold hover:bg-[#E8EAE0] transition-colors flex-shrink-0 whitespace-nowrap">
          查看
        </a>
      )}
      <div className="absolute top-2 right-2 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <button onClick={() => onEdit(item)} className="p-1.5 bg-white/90 rounded-full text-blue-400 shadow-sm border border-gray-100 hover:scale-110">
          <FontAwesomeIcon icon={faPen} className="text-xs" />
        </button>
        <button onClick={() => onDelete(item.id)} className="p-1.5 bg-white/90 rounded-full text-red-400 shadow-sm border border-gray-100 hover:scale-110">
          <FontAwesomeIcon icon={faTrashCan} className="text-xs" />
        </button>
      </div>
    </div>
  );
};