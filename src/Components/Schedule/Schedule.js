import {useState, useEffect} from 'react';
import Timeline from 'react-calendar-timeline';
import 'react-calendar-timeline/lib/Timeline.css';
import moment from 'moment';
import Modal from './Modal';
import FullCalendar from './FullCalendar';
import DeleteModal from './DeleteModal';

const groups = [{ id: 1, title: "N373AF" }, { id: 2, title: "N3285R" }, { id: 3, title: "N116EP" }, { id: 4, title: "N172L" }, { id: 5, title: "N325YZ" }]


// Kept this here so the data structure of the events can be easily determined
// const itemsTest = [
   
//     {
//         id: 1,
//         group: 3,
//         title: 'Unix',
//         start_time: 1621058340 * 1000,
//         end_time: 1621079940 * 1000
//     },
//     {
//         group: 1,
//         title: "john",
//         start_time: 1621346400000,
//         end_time: 1621357200000,
//     }
// ]


 


const Schedule = ({ loggedIn }) => {

    const [items, setItems] = useState([]);
    const [showAddEvent, setShowAddEvent] = useState(false)
    const [showDelete, setShowDelete] = useState(false)
    const [idToDelete, setIdToDelete] = useState(null)
    const [dateToView, setDateToView] = useState(null)
    const [showCalendar, setShowCalendar] = useState(true)
    const [showTimeline, setShowTimeline] = useState(false)

    const getEvents = async () => {
        try {
            const response = await fetch('https://tailwind-backend.herokuapp.com/Events')
            const data = await response.json();
            setItems(data)
        } catch (error) {
            console.error(error)
        }
    }



    const handleAdd = () => {
        setShowAddEvent(true)
    }

    const handleClose = () => {
        setShowAddEvent(false)
    }

    const handleShow = (state, changeState) => {
        state ? changeState(false) : changeState(true)
    }

    const handleDayClick = (value) => {
        let dateToSet = JSON.stringify(value).split('T')[0].replace('"', '')
        let unixTime = moment(dateToSet, "YYYY/MM/DD").unix() * 1000
        setDateToView(unixTime)
        handleShow(showTimeline, setShowTimeline)
        handleShow(showCalendar, setShowCalendar)
    }

    const checkIfCanBeDelete = async (id) => {
        try {
            const response = await fetch(`https://tailwind-backend.herokuapp.com/Events/${id}`)
            const data = await response.json();
            console.log(data[0].username)
            if(data[0].username === window.localStorage.getItem('username')) {
                setIdToDelete(id)
                setShowDelete(true)
            }
        } catch (error) {
            console.error(error)
        }
    }

    useEffect(() => {
        getEvents()
    }, [])

    return (
        <div className="h-screen w-screen">
            {showCalendar ? <FullCalendar setDateToView={setDateToView} handleDayClick={handleDayClick}/> : 
            <div className="my-6">
                <button className="text-2xl bg-gray-500 text-white px-2 rounded-2xl mr-6" onClick={() => {
                    handleShow(showTimeline, setShowTimeline)
                    handleShow(showCalendar, setShowCalendar)
                }}>BACK</button>
                {loggedIn ? 
                        <button className="text-2xl bg-blue-500 text-white px-2 rounded-2xl" onClick={handleAdd}>ADD</button>
                        :
                        <></>
                    }
            </div>
            }
            
            {showAddEvent ? <Modal handleClose={handleClose} items={items} setItems={setItems} getEvents={getEvents}/> : <></>}
            {showTimeline ? 
            <div>
                
                <Timeline
                    groups={groups}
                    items={items}
                    defaultTimeStart={dateToView}
                    defaultTimeEnd={dateToView + 86400000}
                    // visibleTimeStart={dateToView}
                    sidebarWidth={100}
                    onCanvasClick={(groupId, time, e) => console.log(groupId, time), handleAdd}
                    onItemClick={(itemId, e, time) => checkIfCanBeDelete(itemId)}
                />
            </div> : <></>}
            {showDelete ?
            <DeleteModal setShowDelete={setShowDelete} idToDelete={idToDelete} getEvents={getEvents}/> :
            <></>
            }
        </div>
    )
}

export default Schedule
