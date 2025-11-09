import {ThreadPrimitive} from "@assistant-ui/react";

export default function ThreadWelcome() {
    return (
        <ThreadPrimitive.Empty>
            <div className="flex w-full max-w-[var(--thread-max-width)] flex-grow flex-col">
                <div className="flex w-full flex-grow flex-col items-center justify-center">
                    <p className="mt-4 font-medium">
                        Сервис BrainWave объединяет несколько источников знаний: государственных законов, правила
                        проведения операций и руководство пользователя по программе. ИИ-помощник и выдаёт единый, точный
                        и понятный ответ на сложные запросы, что позволяет экономить сотрудникам время. Сотрудник может
                        оценить качество ответа, что помогает совершенствовать алгоритмы BrainWave
                        <br/>
                        <br/>
                        1. Перейти по ссылке <a href={"http://95.215.56.225:3000/"} style={{textDecoration: "underline"}}>http://95.215.56.225:3000/</a>
                        <br/>
                        2. Выбрать операцию в нижнем поле
                        <br/>
                        3. Выбрать тип лица (физическое, юридическое) для каждого участника
                        <br/>
                        4. Выбрать, являются ли участники налоговыми резидентами РФ
                        <br/>
                        5. Отправить запрос
                    </p>
                </div>
            </div>
        </ThreadPrimitive.Empty>
    );
};
