import axios from "axios";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Modal from "../modal/modal";
import { ModalPortal } from "../modal/ModalPortal";
import { useModalStore } from "../../store/store";

import basicUserImage from "../../assets/user.webp";
import moveBtn from "../../assets/goBackIcon.webp";

import tempImage from "../../assets/main.jpg";

const UserInfoPage = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { openModal } = useModalStore();
  const navigate = useNavigate();

  const [userInfo, setUserInfo] = useState({
    username: "",
    name: "",
    email: "",
    password: "",
  });
  const [userTravelPlan, setUserTravelPlan] = useState([]); //여행일정
  const [userTravelInfo, setUserTravelInfo] = useState([]); //여행기
  const mergedUserTravelInfo = userTravelPlan.map((plan) => {
    const correspondingInfo = userTravelInfo.find(
      (info) => info.plan_id === plan.plan_id
    );

    return {
      plan_id: plan.plan_id,
      plan_start: plan.start_date,
      plan_end: plan.end_date,
      plan_update: plan.updated_at,
      plan_destination: plan.destination,
      id: correspondingInfo ? correspondingInfo.id : "",
      diary_update: correspondingInfo ? correspondingInfo.updated_at : "",
    };
  });

  const travelPlanCount = userTravelPlan.length;
  const travelInfoCount = userTravelInfo.length;

  const [area, setArea] = useState({
    name_en: "",
    name_ko: "",
    image: "",
  });

  const changetoKoreaDate = (dateString) => {
    if (!dateString) {
      return "";
    }
    const date = new Date(dateString);

    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");

    return `${year}.${month}.${day}`;
  };

  const handleWriteClick = () => {
    const planId = mergedUserTravelInfo[currentIndex].plan_id;
    history.push("/TravelWritePage", { planId });
  };

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const userInfoResponse = await axios.get(
          "http://localhost:3000/mypage/",
          {
            params: {
              username: userInfo.username,
              name: userInfo.name,
              email: userInfo.email,
            },
            withCredentials: true,
          }
        );
        setUserInfo(userInfoResponse.data.userData);
      } catch (error) {
        console.log(error);
        navigate("/login");
      }
    };

    const fetchUserTravelInfo = async () => {
      //여행기
      try {
        const userTravelInfoResponse = await axios.get(
          "http://localhost:3000/mypage/diary",
          {
            params: {
              id: userTravelInfo.id,
              plan_id: userTravelInfo.plan_id,
              updated_at: userTravelInfo.updated_at,
            },
            withCredentials: true,
          }
        );
        setUserTravelInfo(userTravelInfoResponse.data);
      } catch (error) {
        console.log(error);
      }
    };
    const fetchUserTravelDate = async () => {
      //여행일정
      try {
        const userTravelPlanResponse = await axios.get(
          "http://localhost:3000/travels/",
          {
            params: {
              plan_id: userTravelPlan.plan_id,
              start_date: userTravelPlan.start_date,
              end_date: userTravelPlan.end_date,
              destination: userTravelPlan.destination,
              updated_at: userTravelPlan.updated_at,
            },
            withCredentials: true,
          }
        );
        setUserTravelPlan(userTravelPlanResponse.data.travelPlanData);
      } catch (error) {
        console.log(error);
      }
    };

    const fetchArea = async () => {
      try {
        const areaResponse = await axios.get(
          `http://localhost:3000/destinations/${area.location_id}`,
          {
            params: {
              name_en: area.name_en,
              name_ko: area.name_ko,
              image: area.image,
            },
          }
        );
        setArea(areaResponse.data);
      } catch (error) {
        console.log(error);
      }
    };

    fetchUserInfo();
    fetchUserTravelInfo();
    fetchArea();
    fetchUserTravelDate();
  }, []);

  const handleClickNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % travelPlanCount);
  };

  const handleClickPrev = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? travelPlanCount - 1 : prevIndex - 1
    );
  };

  const handleDeleteButtonClick = async () => {
    try {
      const planIdToDelete = mergedUserTravelInfo[currentIndex].plan_id;
      await axios.delete(`http://localhost:3000/travels/${planIdToDelete}`, {
        withCredentials: true,
      });
      setUserTravelPlan((prevPlan) =>
        prevPlan.filter((plan) => plan.plan_id !== planIdToDelete)
      );
      console.log("데이터가 성공적으로 삭제되었습니다.");
      window.location.reload();
    } catch (error) {
      console.log(error);
    }
  };

  const UserInfoUpdateModalContent = () => {
    const [user, setUser] = useState({
      email: "",
      password: "",
      passwordConfirm: "",
    });

    const handleValueChange = ({ target: { value, name } }) => {
      setUser((prev) => ({ ...prev, [name]: value }));
      console.log(user);
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      const passwordRegex =
        /^(?=.*[a-zA-Z])(?=.*[!@#$%^*+=-])(?=.*[0-9]).{10,20}$/;

      try {
        if (!user.email === userInfo.email) {
          alert("새로운 이메일을 입력해주세요.");
          return;
        } else if (user.password) {
          if (!passwordRegex.test(user.password)) {
            alert("비밀번호에 문자, 숫자, 특수문자를 포함해야 합니다.");
            return;
          } else if (user.password !== user.passwordConfirm) {
            alert("비밀번호가 일치하지 않습니다.");
            return;
          }
        }

        const updateResponse = await axios.patch(
          "http://localhost:3000/users/",
          {
            password: user.password,
            email: user.email,
          },
          { withCredentials: true }
        );
        setUserInfo(updateResponse.data);
        //console.log(updateResponse);
        navigate("/");

        alert("회원정보가 수정되었습니다.");
      } catch (error) {
        console.error(error);
      }
    };

    return (
      <form
        onSubmit={handleSubmit}
        className="w-full flex flex-col justify-center items-center my-5 h-5/6"
      >
        <div className="w-1/6 mb-5 border bg-white border-gray-100 rounded-full flex items-center justify-center shadow-lg">
          <img className="h-full" src={basicUserImage} alt="유저이미지" />
        </div>
        <div className="grid grid-cols-none grid-rows-4 justify-center items-center w-5/12 border-solid grid-underline text-center">
          <div
            className="grid grid-cols-[1fr,2fr] h-4/5 items-center justify-center gap-3 p-2"
            style={{ borderBottom: "1px solid #6645B9" }}
          >
            <div className="text-lg cursor-pointer select-none">이름</div>
            <div className="text-lg select-none text-left">{userInfo.name}</div>
          </div>
          <label
            className="grid grid-cols-[1fr,2fr] h-full items-center justify-center gap-3 p-2"
            style={{ borderBottom: "1px solid #6645B9" }}
          >
            <div className="text-lg select-none">이메일</div>
            <input
              type="text"
              name="email"
              label="이메일"
              value={user.email}
              onChange={handleValueChange}
              placeholder={"이메일을 입력해주세요."}
              className="hide-input-focus outline-none w-full p-2 rounded border border-gray-100"
            />
          </label>
          <label
            className="grid grid-cols-[1fr,2fr]  h-full items-center justify-center gap-3 p-2"
            style={{ borderBottom: "1px solid #6645B9" }}
          >
            <div className="text-lg select-none">비밀번호</div>
            <input
              type="password"
              label="비밀번호"
              name="password"
              value={user.password}
              onChange={handleValueChange}
              minLength={10}
              maxLength={20}
              placeholder={"비밀번호를 입력해주세요."}
              className="hide-input-focus outline-none w-full rounded border border-gray-100 p-2"
            />
            {user.password !== user.passwordConfirm ? (
              <h6 className="text-xs text-rose-600 col-span-2">
                비밀번호가 서로 다릅니다.
              </h6>
            ) : (
              <h6 className="text-xs text-violet-400 col-span-2">
                비밀번호(문자,숫자,특수문자 포함 10~20자)
              </h6>
            )}
          </label>
          <label
            className="grid grid-cols-[1fr,2fr] h-full items-center justify-center gap-3 p-2"
            style={{ borderBottom: "1px solid #6645B9" }}
          >
            <div className="text-lg select-none">비밀번호 확인</div>
            <input
              type="password"
              label="비밀번호 확인"
              name="passwordConfirm"
              value={user.passwordConfirm}
              onChange={handleValueChange}
              minLength={10}
              maxLength={20}
              placeholder={"비밀번호를 다시 입력해주세요."}
              className="hide-input-focus outline-none w-full rounded border border-gray-100 p-2"
            />
          </label>
        </div>
        <div className="flex flex-row w-full justify-center items-center">
          <input
            className="m-5 w-1/6 text-white font-bold text-lg px-4 py-2 rounded shadow-md"
            style={{ backgroundColor: "#B09FCE" }}
            type="submit"
            value="저장"
          />
          <input
            className="m-5 w-1/6 text-white font-bold text-lg px-4 py-2 rounded shadow-md"
            style={{ backgroundColor: "#B09FCE" }}
            type="button"
            value="탈퇴"
          />
        </div>
      </form>
    );
  };

  const openUpdateUserInfoModal = () => {
    openModal({
      modalType: "updateUserInfo",
      style: {
        backgroundColor: "rgb(249, 250, 251)",
        width: "60%",
        height: "85%",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      },
      title: (
        <div className="text-center font-bold text-4xl">회원정보 수정</div>
      ),
      content: <UserInfoUpdateModalContent />,
    });
  };

  return (
    <div className="w-full" style={{ height: "calc(100vh - 4rem)" }}>
      <div className="w-full h-full">
        <div className="w-full h-full flex flex-col justify-center items-center text-center">
          <div className="h-1/5 border border-gray-100 rounded-full flex items-center justify-center shadow-lg">
            <img className="h-full" src={basicUserImage} alt="유저이미지" />
          </div>
          <div className="text-gray-500 font-bold text-lg m-3">
            {userInfo.username} 님 안녕하세요!
          </div>
          <button
            onClick={openUpdateUserInfoModal}
            style={{ backgroundColor: "#B09FCE" }}
            className="text-white font-bold text-lg px-4 py-2 rounded shadow-md"
          >
            프로필 수정
          </button>
          <div className="flex flex-row items-center w-1/5 h-1/5">
            <div className="grid grid-rows-[1fr,2fr] bg-gray-100 w-1/2 h-3/4 m-4 p-3 rounded-2xl">
              <div className="py-1 text-slate-500">나의 일정</div>
              <div
                className="text-5xl py-2 font-bold"
                style={{ color: "#6645B9" }}
              >
                {travelPlanCount}
              </div>
            </div>
            <div className="grid grid-rows-[1fr,2fr] bg-gray-100 w-1/2 h-3/4 m-4 p-3 rounded-2xl">
              <div className="py-1 text-slate-500">나의 여행기</div>
              <div
                className="text-5xl py-2 font-bold"
                style={{ color: "#6645B9" }}
              >
                {travelInfoCount}
              </div>
            </div>
          </div>
          <div
            id="box"
            className="flex flex-col justify-center items-center m-4 bg-gray-100 rounded-2xl w-7/12 h-72 relative"
          >
            {travelPlanCount >= 1 ? (
              <div>
                <div className="flex flex-col justify-center items-center">
                  <div
                    className="flex bg-transparent h-full w-1/12 absolute top-1/2 left-0 transform -translate-y-1/2 
      opacity-0  hover:opacity-100 transition-opacity duration-300
      "
                    onClick={handleClickPrev}
                  >
                    <img
                      id="prevBtn"
                      src={moveBtn}
                      alt="이전"
                      className="w-2/5  object-contain select-none"
                    />
                  </div>
                  <div
                    id="content"
                    className="grid grid-cols-[1fr,1fr,2fr] grid-rows-1 h-5/6 w-11/12 bg-white rounded-2xl shadow-xl"
                  >
                    <div className="flex items-center justify-center p-5">
                      <img
                        className="h-full"
                        src={tempImage}
                        alt="여행지 이미지"
                      />
                    </div>
                    <div className="flex flex-col justify-center">
                      <div
                        className="text-4xl py-2 font-bold"
                        style={{ color: "#6645B9" }}
                      >
                        {mergedUserTravelInfo[currentIndex].plan_destination}
                      </div>
                      <div className="text-2xl py-2 font-bold text-gray-500">
                        대한민국{" "}
                        {mergedUserTravelInfo[currentIndex].plan_destination}
                      </div>
                    </div>
                    <div className="flex flex-col justify-between">
                      <div className="grid grid-cols-[1fr,2fr] grid-rows-3 gap-4 m-7">
                        <div
                          className="font-bold text-lg"
                          style={{ color: "#B09FCE" }}
                        >
                          여행일자
                        </div>
                        <div className="text-lg">
                          {changetoKoreaDate(
                            mergedUserTravelInfo[currentIndex].plan_start
                          )}
                          {" ~ "}
                          {changetoKoreaDate(
                            mergedUserTravelInfo[currentIndex].plan_end
                          )}
                        </div>
                        <div
                          className="font-bold text-lg"
                          style={{ color: "#B09FCE" }}
                        >
                          최종 수정 날짜
                        </div>
                        <div className="text-lg">
                          {changetoKoreaDate(
                            mergedUserTravelInfo[currentIndex].plan_update
                          )}
                        </div>
                        <div
                          className="font-bold text-lg"
                          style={{ color: "#B09FCE" }}
                        >
                          여행기 작성일
                        </div>
                        <div>
                          {mergedUserTravelInfo[currentIndex].diary_update && (
                            <Link
                              to={`/TravelPostDetailPage/${mergedUserTravelInfo[currentIndex].id}`}
                              key={mergedUserTravelInfo[currentIndex].plan_id}
                              className="text-lg text-center cursor-pointer"
                            >
                              {changetoKoreaDate(
                                mergedUserTravelInfo[currentIndex].diary_update
                              )}
                            </Link>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-row justify-between mb-8 mx-7">
                        <button
                          style={{ backgroundColor: "#B09FCE" }}
                          className="text-white  text-lg w-1/3 h-12 p-2 rounded shadow-md"
                        >
                          일정 수정
                        </button>
                        {mergedUserTravelInfo[currentIndex].diary_update ? (
                          <Link
                            to={`/TravelWritePage/${mergedUserTravelInfo[currentIndex].id}`}
                            key={mergedUserTravelInfo[currentIndex].id}
                            style={{ backgroundColor: "#B09FCE" }}
                            className="text-white  text-lg w-1/3 h-12 p-2 mx-4 rounded shadow-md"
                          >
                            여행기 수정
                          </Link>
                        ) : (
                          <Link
                            to={`/TravelWritePage/${mergedUserTravelInfo[currentIndex].plan_id}`}
                            key={mergedUserTravelInfo[currentIndex].plan_id}
                            style={{ backgroundColor: "#B09FCE" }}
                            className="text-white  text-lg w-1/3 h-12 p-2 mx-4 rounded shadow-md"
                          >
                            여행기 작성
                          </Link>
                        )}

                        <button
                          onClick={handleDeleteButtonClick}
                          style={{ backgroundColor: "#B09FCE" }}
                          className="text-white  text-lg w-1/3 h-12 p-2 rounded  shadow-md"
                        >
                          삭제
                        </button>
                      </div>
                    </div>
                  </div>

                  <div
                    className="flex bg-transparent h-full w-1/12 absolute top-1/2 right-0 transform -translate-y-1/2 justify-end opacity-0  hover:opacity-100 transition-opacity duration-300 "
                    onClick={handleClickNext}
                  >
                    <img
                      id="nextBtn"
                      src={moveBtn}
                      alt="다음"
                      className="w-2/5  object-contain transform scale-x-[-1] select-none"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col justify-center items-center h-5/6 w-11/12 bg-white rounded-2xl shadow-xl">
                <div
                  className="text-2xl font-bold select-none my-5"
                  style={{ color: "#6645B9" }}
                >
                  대한민국에는 아직 당신이 경험해보지 못한 곳들이 너무나도
                  많아요!
                </div>
                <a
                  href="/plannerMap"
                  className="text-white text-2xl p-3 mt-2 rounded-md shadow-md"
                  style={{ backgroundColor: "#B09FCE" }}
                >
                  여행 시작하기
                </a>
              </div>
            )}
          </div>
          {travelPlanCount >= 1 && <div>- {currentIndex + 1} -</div>}
        </div>
        <ModalPortal>
          <Modal />
        </ModalPortal>
      </div>
    </div>
  );
};

export default UserInfoPage;
