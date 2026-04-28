---
title: "ISEE.AI - Mechanical Engineering Intern"
size: 4
priority: 10
thumbnail: "/assets/photos/isee-header.jpg"
sections:
  - type: image
    srcs:
      - "/assets/photos/isee-header.jpg"
    tiling: single
    title: "Internship Overview"
    text: "During my 3 -month internship at ISEE, I had the opportunity to work on the mechanical team as a mechanical engineering intern. I was tasked with many projects including creating a test bench, transmission panel enclosure, lidar covers, and much more."

  - type: image
    srcs:
      - "/assets/photos/isee-testbench.jpg"
    tiling: single
    title: "Test Bench Overview"
    text: "My main project at ISEE was to create a test bench for verifying the functionality of the truck's steering sub-assembly before installation in the truck. Previously, issues would be found post installation, causing blockers and wasted time to uninstall, diagnose, and reinstall the steering system. Some of the functions that needed to be verified were the output shaft concentricity, motor function, angle sensor offset and verification, and steering column fitment with the steering sub-assembly."

  - type: image
    srcs:
      - "/assets/photos/isee-testbench-cad.png"
    tiling: single
    title: "Test Bench Design"
    text: "My main design philosophy when creating this test bench was to make the design as user friendly as possible. I strived to make all the functions on the test bench intuitive so that error could be minimized during use. Some factors in the design that reflect this are the use of toggle clamps, function verification panel, item storage, and known plug locations."

  - type: image
    srcs:
      - "/assets/photos/isee-testbench-graph.jpg"
      - "/assets/photos/isee-testbench-simulink.jpg"
    tiling: vertical
    title: "Test Bench Control"
    text: "For the controls aspect of this test bench I was tasked to use Matlab Simulink. Specifically, I used Simulink for analyzing the raw angle sensor values and verifying if they produced expected values. One of the tests that I wrote checked if the angle sensors were incorrectly installed backwards. The way I checked this is by commanding the motor to spin clockwise, and checking if the angle sensors also read clockwise. When spinning clockwise, the angle sensors would produce a decreasing raw value. I verified this by checking if their derivative read substantially negative. One case that I also needed to account for was when the angle sensor wrapped around and read from 1° to 360° which would instantaneously produce a large positive derivative."
  
  - type: image
    srcs:
      - "/assets/photos/isee-testbench-caps.jpg"
      - "/assets/photos/isee-testbench-sketch.png"
    tiling: vertical
    title: "Test Bench CAD"
    text: "For the CAD of the test bench, I used Solidworks and the 3DX PDM platform. For the components on the test bench, I used parametric (equation driven) design to allow for quick iteration and prototyping. For example, the spline covers required a few iterations to land on a design that could snap into place, and also locate on the shaft concentrically. I also verified the precision of the test bench after assembly using a tolerance stack-up analysis. More specifically, I calculated how much the two locating brackets on the bench would deviate from true after assembly, and if it would result in any interference."
  
  - type: image
    srcs:
      - "/assets/photos/isee-cover1.png"
      - "/assets/photos/isee-cover2.png"
      - "/assets/photos/isee-cover3.png"
      - "/assets/photos/isee-cover4.png"
    tiling: quadrant
    title: "New LiDAR Covers"
    text: "Another project that I completed at ISEE was new LiDAR covers. Previously, we used soft covers to cover LiDAR which caused scratches and was not suitable for cycling on and off the trucks. The solution was to create hard shell covers that were more durable and could be removed more easily. I utilized CAD iteration to quickly try multiple ideas, and 3D printing to rapidly prototype different versions of the new LiDAR covers."

  - type: image
    srcs:
      - "/assets/photos/isee-frontcamera-top.png"
      - "/assets/photos/isee-frontcamera-bottom.png"
      - "/assets/photos/isee-frontcamera-photo.jpg"
    tiling: side
    title: "Camera Mounts"
    text: "In an effort to maintain safety of the truck, I was tasked with developing remote monitoring camera mounts to hold cameras which would allow remote operators to see how the truck is moving. I was provided with camera dimensions and viewing parameters which would allow the cameras to see around the truck. I used Solidworks for CAD and 3D printing as a method for manufacturing."
  
  - type: image
    srcs:
      - "/assets/photos/isee-panel-enclosure-cad.png"
      - "/assets/photos/isee-panel-enclosure-crosssection.png"
      - "/assets/photos/isee-panel-enclosure-photo1.jpg"
      - "/assets/photos/isee-panel-enclosure-photo2.jpg"
    tiling: quadrant
    title: "Panel Enclosure"
    text: "I was tasked with designing an IP-65 rated enclosure to house a custom PCB. I developed the footprint and decided on component placement using Altium Co-Designer, along with input from the electrical team. I designed the enclosure using Solidworks, and took advantage of rapid prototyping to quickly create a design that could fit all of the provided constraints. I also created a GD&T tolerance stackup of the multiple components inside of the enclosure to guarantee their ability to be assembled after  accounting for manufacturing tolerances. Finally, I created drawings and sent them off to  have the enclosure be machined by a 3rd party service. "
---
