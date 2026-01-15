cmake_minimum_required(VERSION 3.16)

project(QuotationQt VERSION 0.1 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

find_package(Qt6 REQUIRED COMPONENTS Widgets)

set(PROJECT_SOURCES
    src/main.cpp
    src/mainwindow.cpp
    src/mainwindow.h
)

add_executable(QuotationQt
    ${PROJECT_SOURCES}
)

target_link_libraries(QuotationQt PRIVATE Qt6::Widgets)

# Set properties for bundle on macOS
set_target_properties(QuotationQt PROPERTIES
    MACOSX_BUNDLE TRUE
)

if(WIN32)
    set_target_properties(QuotationQt PROPERTIES
        WIN32_EXECUTABLE TRUE
    )
endif()
