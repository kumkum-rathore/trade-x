import {
    useEffect,
    useState
} from "react";

import api from "../services/api";

import MainLayout
    from "../components/layout/MainLayout";


function News() {

    const [news, setNews] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");


    const fetchNews = async () => {

        try {

            setLoading(true);

            const response =
                await api.get("/news");

            setNews(
                response.data.data
            );

        } catch (error) {

            console.log(error);

            setError(
                error.response?.data?.message ||
                "Failed to load news"
            );

        } finally {

            setLoading(false);

        }
    };


    useEffect(() => {

        fetchNews();

    }, []);


    if (loading) {

        return (

            <MainLayout>

                <div className="news-page">

                    Loading news...

                </div>

            </MainLayout>

        );

    }


    return (

        <MainLayout>

            <div className="news-page">

                <div className="page-header">

                    <h1>
                        Market News
                    </h1>

                    <p>
                        Latest stock market
                        updates and analysis
                    </p>

                </div>


                {error && (

                    <div className="news-error">

                        {error}

                    </div>

                )}


                <div className="news-grid">

                    {news.map((item) => (

                        <article
                            className="news-card"
                            key={item.id}
                        >

                            <div className="news-card-top">

                                <span className="news-category">

                                    {item.category}

                                </span>

                                <span className="news-time">

                                    {item.time}

                                </span>

                            </div>


                            <h2>
                                {item.title}
                            </h2>


                            <p>
                                {item.description}
                            </p>


                            <div className="news-card-bottom">

                                <span>
                                    {item.source}
                                </span>

                                <button>
                                    Read More
                                </button>

                            </div>

                        </article>

                    ))}

                </div>

            </div>

        </MainLayout>

    );

}


export default News;