import React, { useState, useEffect } from "react";
import axios from "axios";
import addButton from '../../assets/addIcon.png';
import deletButton from '../../assets/deletIcon.png';
import goBackIcon from '../../assets/goBackIcon.png';

const userImage = [deletButton, deletButton]; // 더미데이터

function TravelWrite() {
  const [selectImages, setSelectImages] = useState([]);
  const [title, setTittle] = useState('');
  const [content, setContent] = useState('');
  useEffect(() => {
    setSelectImages(prevImages => {
      const initialImages =[]; 
      for (let i = 0; i < userImage.length; i++) {
        initialImages[i] = userImage[i];
      }
      return initialImages;
    });
  }, []);

  const handleImageDelete = (index) => {
    setSelectImages(prevImages => prevImages.filter((_, i) => i !== index));
  };

  const handleBoxClick = (index) => {
    const fileInput = document.getElementById(`file-input-${index}`);
    fileInput.click();
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];

    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const imageUrl = reader.result;
      setSelectImages(prevImages => [...prevImages, imageUrl].filter(Boolean));
    };
    reader.readAsDataURL(file);
  };

  const handleImageClick = (index) => {
    if (selectImages[index]) {
      handleImageDelete(index);
    } else {
      handleBoxClick(index);
    }
  };

  const handleTittleChange = (e) => {
    setTittle(e.target.value);
  };
  const handleContentChange = (e) => {
    setContent(e.target.value);
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    // submit
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex justify-center items-center p-16" style={{ height: 'calc(100vh - 7rem)' }}>
      <div className="grid grid-cols-2 gap-8 w-4/5 h-full">
        <div style={{ width: '100%', height: '100%', margin: '2%' }}>
          <a href="/mypage" className="flex flex-row items-center w-40 h-16 mb-12 "  style={{ cursor: 'pointer' }} onClick={''}>
            <img src={goBackIcon} className="w-6 h-6 mr-6" alt="go back to mypage" />
            <span className="text-2xl">마이페이지</span>
          </a>
          <div className="grid grid-cols-2 grid-rows-2 w-full" style={{ height: 'calc(100% - 5.5rem)' }}>
            {[...Array(4)].map((_, index) => (
              <div
                key={index}
                className={`imageBox flex justify-center items-center h-0 relative cursor-pointer overflow-hidden rounded-2xl
                ${selectImages[index] ? '' : 'emptyImage'}`}
                style={{width: 'calc(95% - 14px)', paddingBottom: '100%', backgroundColor: '#DCDCDC'}}
                onClick={() => handleImageClick(index)}
              >
                {selectImages[index] && (
                  <div>
                    <img src={selectImages[index]} alt={`Image ${index + 1}`} className="absolute top-0 left-0 w-full h-full object-cover" />
                    <img
                      src={deletButton}
                      onClick={() => handleImageDelete(index)}
                      className='absolute bottom-0 right-0 object-cover w-1/6' style={{transform: 'translate(-30%, -30%)'}}
                    />
                  </div>
                )}
                {!selectImages[index] && (
                  <div>
                    <input
                      id={`file-input-${index}`}
                      type="file"
                      className="hidden"
                      onChange={(event) => handleImageUpload(event, index)}
                      onClick={(event) => event.stopPropagation()}
                    />
                    <img className='absolute bottom-0 right-0 object-cover w-1/6' style={{transform: 'translate(-30%, -30%)'}}
                    src={addButton} alt="Add Image" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col justify-between items-end w-full h-full" style={{ margin: '2%' }}>
          <div className="flex flex-col w-full mt-6">
            <div className="grid grid-cols-[10rem,1fr] justify-center items-center w-full border-b border-gray-300 h-20 ">
              <div className="py-2 px-4 text-lg font-normal justify-self-center "></div>
              {/* <div className="py-2 px-4 text-right">토글</div> */}
            </div>
            <div className="grid grid-cols-[10rem,1fr] justify-center items-center w-full border-b border-gray-300 h-20 ">
              <div className="py-4 px-4 text-lg font-normal justify-self-center select-none">지역</div>
              <div className="py-2 px-4 select-none">제주도</div>
            </div>
            <div className="grid grid-cols-[10rem,1fr] justify-center items-center w-full border-b border-gray-300 h-20 ">
              <div className="py-2 px-4 text-lg font-normal justify-self-center select-none">제목</div>
              <div className="h-full py-2 px-4">
                <input
                  type="text"
                  onChange={handleTittleChange}//임시
                  value={title} //임시
                  placeholder="제목을 입력해주세요."
                  style={{ border: '1px solid #B09FCE' }}
                  className="w-full h-full text-lg px-4 py-2  hide-input-focus outline-none"
                />
              </div>
            </div>
            <div className="grid grid-cols-[10rem,1fr] justify-center items-center w-full h-96">
              <div className="py-2 px-4 text-lg font-normal justify-self-center select-none">본문</div>
              <div className="h-full py-4 px-4 ">
                <textarea
                  onChange={handleContentChange}//임시
                  value={content} //임시
                  placeholder="본문 내용을 입력해주세요."
                  style={{ border: '1px solid #B09FCE' }}
                  className="w-full h-full text-lg px-4 py-2  hide-input-focus outline-none"
                />
              </div>
            </div>
          </div>
          <input
            type="submit"
            value="여행기 작성"
            style={{ background: '#B09FCE' }}
            className="mt-5 px-24 py-3 text-white text-xl font-bold rounded shadow-md"
          />
        </div>
      </div>
    </div>
    </form>
  );
}

export default TravelWrite;
