import numpy as np
import math
import sys
import os
from ezdxf.r12writer import r12writer
from operator import itemgetter, attrgetter
from math import atan2,degrees

try:
    __location__ = os.path.realpath(
        os.path.join(os.getcwd(), os.path.dirname(__file__)))
except:
    __location__ = '/Users/tommy/Documents/tommy/test_jia/src/controller'
    
_use_ewd_file = False

ewd_input = ""
ewd_name = ""
try:
    ewd_input = sys.argv[1]
except:
    _use_ewd_file = True
    
try:
    ewd_name = sys.argv[2]
except:
    ewd_name = 'mask'
    
if len(ewd_input) < 10:
    _use_ewd_file = True
if len(ewd_name) > 20:
    ewd_name = 'mask'
    
class Grid():
    def __init__(self, real_x=-1, real_y=-1, grid_x=-1, grid_y=-1, type=0):
        self.index = -1
        self.real_x = int(real_x)
        self.real_y = int(real_y)
        self.grid_x = grid_x
        self.grid_y = grid_y
        self.electrode_x = 0
        self.electrode_y = 0
        self.electrode_x2 = 0
        self.electrode_y2 = 0
        self.special = False
        self.type = type # 0 as grids in block2, 1 as electrodes, >2 as num_electrode in a grid, -1 as contact pads in block1&3, -2 as missing pin in block1&3
        self.electrode_index = -1
        self.in_x = -1
        self.in_y = -1
        self.out_x = -1
        self.out_y = -1
        self.safe_distance=0
        self.safe_distance2=0
        self.neighbor_electrode = []
        self.neighbor = []
        self.flow=0
        self.cost=0
        
class Tile():
    def __init__(self):
        self.real_x = 0
        self.real_y = 0
        self.tile_x = 0
        self.tile_y = 0
        self.capacity = 2
        self.flow = [0,0]
        self.total_flow=0
        self.index = -1
        self.neighbor = []
        self.corner_in = []
        self.contact_pads = []
        self.vertical_path = []
        self.horizontal_path = []
        
class Hub():
    def __init__(self, real_x=-1, real_y=-1, type=-1, hub_index=-1):
        self.real_x = int(real_x)
        self.real_y = int(real_y)
        self.flow = 0
        self.index = -1
        self.hub_index = hub_index
        self.type=type
        self.neighbor = []
        
class Electrode():
    def __init__(self, real_x=-1, real_y=-1, shape=-1, electrode_index=-1):
        self.real_x = int(real_x)
        self.real_y = int(real_y)
        self.shape = shape
        self.electrode_index = electrode_index
        self.boundary_U=0
        self.boundary_D=0
        self.boundary_L=0
        self.boundary_R=0
        self.surround=0
        self.index = -1
        
class Path():
    def __init__(self, start_x=0,start_y=0,end_x=0,end_y=0):
        self.start_x = start_x
        self.start_y = start_y
        self.end_x = end_x
        self.end_y = end_y
        self.next=None
        self.head=1
        
def getdegree(x1,y1,x2,y2):
    x=x1-x2
    y=y1-y2
    hypotenuse = math.sqrt(x**2+y**2)
    if hypotenuse == 0:
        return(0,1)
    sin = x/hypotenuse
    cos = y/hypotenuse
    return (sin,cos)

def inner_degree(x1,y1,x2,y2):
    x=x1-x2
    y=y1-y2
    deg=0
    if x==0 and y>0:
        deg = 0
    if x==0 and y<0:
        deg = 180
    if y==0 and x>0:
        deg = 90
    if y==0 and x<0:
        deg = 270
    if x>0 and y>0:
        deg = 360 + math.atan(x/y)*180/math.pi
    elif x<0 and y>0:
        deg = 360 + math.atan(x/y)*180/math.pi
    elif x<0 and y<0:
        deg = 180 + math.atan(x/y)*180/math.pi
    elif x>0 and y<0:
        deg = 180 + math.atan(x/y)*180/math.pi
    return int((deg+405)%360)

def draw_orthogonal_path(x1,y1,x2,y2,x3,y3,x4,y4,width,connect, dxf):
    #polyline= dxf.polyline(linetype=None)
    position1 = []
    position2 = []
    deg_90_UD = 0
    deg_90_RL = 0
    deg_45 = 0
    Tan = 82.842712/2
    if width==50:
        Tan=(Tan/2)

    degree1 = getdegree(x1,y1,x2,y2)
    degree2 = getdegree(x2,y2,x3,y3)
    if x2==x3 and y2==y3:
        return 0
    if x2==x1 and y2==y1:
        return 0

    if y2 == y3 and width!=50:
        degree1 = (1,0)
        degree2 = (1,0)
    elif x2 == x3 and width!=50:
        degree1 = (0,1)
        degree2 = (0,1)

    if y3 == y4 and x2!=x3 and width!=50:
        degree2 = (1,0)
    elif x3 == x4 and y2!=y3 and width!=50:
        degree2 = (0,1)
    # 1/\4
    # 2\/3
    #45 angle
    if x2!=x3 and y2!=y3 and width!=50:
        if x2>x3:
            if y2>y3:
                deg_45=2
            elif y2<y3:
                deg_45=1
        elif x2<x3:
            if y2>y3:
                deg_45=3
            elif y2<y3:
                deg_45=4
    #head
    #tail

    #90 angle
    if (x3 == x4 and y2==y3) and width!=50:
        deg_90_UD = 1
    if (y3 == y4 and x2==x3) and width!=50:
        deg_90_RL = 1
    if y1 == y2 and x2!=x3 and width!=50:
        degree1 = (1,0)
    position_s1 = [x2-width*degree1[1],y2+width*degree1[0],inner_degree(x2-width*degree1[1],y2+width*degree1[0],(x2+x3)/2,(y2+y3)/2)]
    position_s2 = [x2+width*degree1[1],y2-width*degree1[0],inner_degree(x2-width*degree1[1],y2+width*degree1[0],(x2+x3)/2,(y2+y3)/2)]
    if width==50:
        if x1!=x2 and y1!=y2:
            if x2==x3:
                if x1>x2:
                    if y2>y3:
                        position_s1=[x2+width,y2,1]
                        position_s2=[x2-width,y2,2]
                    elif y2<y3:
                        position_s1=[x2+width,y2,1]
                        position_s2=[x2-width,y2,2]
                elif x1<x2:
                    if y2>y3:
                        position_s1=[x2-width,y2,1]
                        position_s2=[x2+width,y2,2]
                    elif y2<y3:
                        position_s1=[x2-width,y2,1]
                        position_s2=[x2+width,y2,2]
            elif y2==y3:
                if y1>y2:
                    if x2>x3:
                        position_s1=[x2,y2-width,1]
                        position_s2=[x2,y2+width,2]
                    elif x2<x3:
                        position_s1=[x2,y2-width,1]
                        position_s2=[x2,y2+width,2]
                elif y1<y2:
                    if x2>x3:
                        position_s1=[x2,y2+width,1]
                        position_s2=[x2,y2-width,2]
                    elif x2<x3:
                        position_s1=[x2,y2+width,1]
                        position_s2=[x2,y2-width,2]
    if abs(position_s1[2]-position_s2[2])>90:
        if min(position_s1[2],position_s2[2]) == position_s1[2]:
            position_s2[2]-=360
        else:
            position_s1[2]-=360

    if deg_45!=0:# and connect!=1:
        #dxf.add_solid([(x2+width/2,y2+width/2),(x2-width/2,y2+width/2),(x2+width/2,y2-width/2),(x2-width/2,y2-width/2)])

        if deg_45==1:
            if x1==x2:
                position_s1[0]=x2-width
                position_s1[1]=y2-Tan
                position_s2[0]=x2+width
                position_s2[1]=y2+Tan
            elif y1==y2:
                position_s1[0]=x2+Tan
                position_s1[1]=y2+width
                position_s2[0]=x2-Tan
                position_s2[1]=y2-width
        elif deg_45==2:
            if x1==x2:
                position_s1[0]=x2-width
                position_s1[1]=y2+Tan
                position_s2[0]=x2+width
                position_s2[1]=y2-Tan
            elif y1==y2:
                position_s1[0]=x2+Tan
                position_s1[1]=y2-width
                position_s2[0]=x2-Tan
                position_s2[1]=y2+width
        elif deg_45==3:
            if x1==x2:
                position_s1[0]=x2+width
                position_s1[1]=y2+Tan
                position_s2[0]=x2-width
                position_s2[1]=y2-Tan
            elif y1==y2:
                position_s1[0]=x2-Tan
                position_s1[1]=y2-width
                position_s2[0]=x2+Tan
                position_s2[1]=y2+width
        elif deg_45==4:
            if x1==x2:
                position_s1[0]=x2+width
                position_s1[1]=y2-Tan
                position_s2[0]=x2-width
                position_s2[1]=y2+Tan
            elif y1==y2:
                position_s1[0]=x2-Tan
                position_s1[1]=y2+width
                position_s2[0]=x2+Tan
                position_s2[1]=y2-width
    elif x1!=x2 and y1!=y2 and connect!=1:#and width!=50:
        if x1>x2:
            if y1>y2:
                if y2==y3:
                    position_s1[0]=x2-Tan
                    position_s1[1]=y2+width
                    position_s2[0]=x2+Tan
                    position_s2[1]=y2-width
                elif x2==x3:
                    position_s1[0]=x2+width
                    position_s1[1]=y2-Tan
                    position_s2[0]=x2-width
                    position_s2[1]=y2+Tan
            elif y1<y2:
                if y2==y3:
                    position_s1[0]=x2-Tan
                    position_s1[1]=y2-width
                    position_s2[0]=x2+Tan
                    position_s2[1]=y2+width
                elif x2==x3:
                    position_s1[0]=x2+width
                    position_s1[1]=y2+Tan
                    position_s2[0]=x2-width
                    position_s2[1]=y2-Tan
        elif x1<x2:
            if y1>y2:
                if y2==y3:
                    position_s1[0]=x2+Tan
                    position_s1[1]=y2+width
                    position_s2[0]=x2-Tan
                    position_s2[1]=y2-width
                elif x2==x3:
                    position_s1[0]=x2-width
                    position_s1[1]=y2-Tan
                    position_s2[0]=x2+width
                    position_s2[1]=y2+Tan
            elif y1<y2:
                if y2==y3:
                    position_s1[0]=x2+Tan
                    position_s1[1]=y2-width
                    position_s2[0]=x2-Tan
                    position_s2[1]=y2+width
                elif x2==x3:
                    position_s1[0]=x2-width
                    position_s1[1]=y2+Tan
                    position_s2[0]=x2+width
                    position_s2[1]=y2-Tan
    position1.append(position_s1)
    position1.append(position_s2)
    position1.sort(key=lambda k: [k[2]])
    position_e1 = [x3+width*degree2[1],y3-width*degree2[0],inner_degree(x3+width*degree2[1],y3-width*degree2[0],(x2+x3)/2,(y2+y3)/2)]
    position_e2	= [x3-width*degree2[1],y3+width*degree2[0],inner_degree(x3-width*degree2[1],y3+width*degree2[0],(x2+x3)/2,(y2+y3)/2)]
    if deg_45!=0 :
        dxf.add_solid([(x3,y3+width),(x3-width,y3),(x3+width,y3),(x3,y3-width)])

        if deg_45==1:
            if x3==x4:
                position_e1[0]=x3+width
                position_e1[1]=y3+Tan
                position_e2[0]=x3-width
                position_e2[1]=y3-Tan
            elif y3==y4:
                position_e1[0]=x3-Tan
                position_e1[1]=y3-width
                position_e2[0]=x3+Tan
                position_e2[1]=y3+width
        elif deg_45==2:
            if x3==x4:
                position_e1[0]=x3+width
                position_e1[1]=y3-Tan
                position_e2[0]=x3-width
                position_e2[1]=y3+Tan
            elif y3==y4:
                position_e1[0]=x3-Tan
                position_e1[1]=y3+width
                position_e2[0]=x3+Tan
                position_e2[1]=y3-width
        elif deg_45==3:
            if x3==x4:
                position_e1[0]=x3-width
                position_e1[1]=y3-Tan
                position_e2[0]=x3+width
                position_e2[1]=y3+Tan
            elif y3==y4:
                position_e1[0]=x3+Tan
                position_e1[1]=y3+width
                position_e2[0]=x3-Tan
                position_e2[1]=y3-width
        elif deg_45==4:
            if x3==x4:
                position_e1[0]=x3-width
                position_e1[1]=y3+Tan
                position_e2[0]=x3+width
                position_e2[1]=y3-Tan
            elif y3==y4:
                position_e1[0]=x3+Tan
                position_e1[1]=y3-width
                position_e2[0]=x3-Tan
                position_e2[1]=y3+width
    elif x3!=x4 and y3!=y4:# and width!=50:
        if x3>x4:
            if y3>y4:
                if y2==y3:
                    position_e1[0]=x3+Tan
                    position_e1[1]=y3-width
                    position_e2[0]=x3-Tan
                    position_e2[1]=y3+width
                elif x2==x3:
                    position_e1[0]=x3-width
                    position_e1[1]=y3+Tan
                    position_e2[0]=x3+width
                    position_e2[1]=y3-Tan
            elif y3<y4:
                if y2==y3:
                    position_e1[0]=x3+Tan
                    position_e1[1]=y3+width
                    position_e2[0]=x3-Tan
                    position_e2[1]=y3-width
                elif x2==x3:
                    position_e1[0]=x3-width
                    position_e1[1]=y3-Tan
                    position_e2[0]=x3+width
                    position_e2[1]=y3+Tan
        elif x3<x4:
            if y3>y4:
                if y2==y3:
                    position_e1[0]=x3-Tan
                    position_e1[1]=y3-width
                    position_e2[0]=x3+Tan
                    position_e2[1]=y3+width
                elif x2==x3:
                    position_e1[0]=x3+width
                    position_e1[1]=y3+Tan
                    position_e2[0]=x3-width
                    position_e2[1]=y3-Tan
            elif y3<y4:
                if y2==y3:
                    position_e1[0]=x3-Tan
                    position_e1[1]=y3+width
                    position_e2[0]=x3+Tan
                    position_e2[1]=y3-width
                elif x2==x3:
                    position_e1[0]=x3+width
                    position_e1[1]=y3-Tan
                    position_e2[0]=x3-width
                    position_e2[1]=y3+Tan

    if deg_90_UD==1:
        if x2>x3:
            position_e1[0]-=width
            position_e2[0]-=width
        elif x2<x3:
            position_e1[0]+=width
            position_e2[0]+=width

    if deg_90_RL==1:
        if y2>y3:
            position_e1[1]-=width
            position_e2[1]-=width
        elif y2<y3:
            position_e1[1]+=width
            position_e2[1]+=width		
    if width==50:
        if x2!=x3 and y2!=y3:
            if x3==x4:
                position_e1[0]=x3+70.7
                position_e1[1]=y3
                position_e2[0]=x3-70.7
                position_e2[1]=y3
            elif y3==y4:
                position_e1[0]=x3
                position_e1[1]=y3+70.7
                position_e2[0]=x3
                position_e2[1]=y3-70.7
    if abs(position_e1[2]-position_e2[2])>90:
        if min(position_e1[2],position_e2[2]) == position_e1[2]:
            position_e2[2]-=360
        else:
            position_e1[2]-=360
    position2.append(position_e1)
    position2.append(position_e2)
    position2.sort(key=lambda k: [k[2]],reverse=True)

    dxf.add_solid([(position1[0][0],position1[0][1]),(position1[1][0],position1[1][1]),
                      (position2[0][0],position2[0][1]),(position2[1][0],position2[1][1])])    

    dxf.add_solid([(position1[0][0],position1[0][1]),(position1[1][0],position1[1][1]),
                      (position2[1][0],position2[1][1]),(position2[0][0],position2[0][1])])
    
def draw_path(x1,y1,x2,y2,x3,y3,x4,y4,width,connect,dxf):
    y1 = -1*y1
    y2 = -1*y2
    y3 = -1*y3
    y4 = -1*y4
    if width==50:
        dxf.add_arc(center=(x3,y3),radius=100,start=0, end=359)
    draw_orthogonal_path(x1,y1,x2,y2,x3,y3,x4,y4,width,connect,dxf)
    
def draw_start(x1,y1,x2,y2,x3,y3,width,dxf):
    y1 = -y1
    y2 = -y2
    y3 = -y3
    degree1 = getdegree(x1,y1,x2,y2)
    Tan=41/2
    if x1 != x2 and y1 != y2:
        S1=(x1-width*degree1[1],y1+width*degree1[0])
        S2=(x1+width*degree1[1],y1-width*degree1[0])
        if x2!=x3 and y2!=y3:
            E1=(x2-width*degree1[1],y2+width*degree1[0])
            E2=(x2+width*degree1[1],y2-width*degree1[0])
        elif x2==x3 and y2==y3:
            return 0
        elif x2==x3:
            if x1>x2:
                if y2>y3:
                    E1=(x2+width,y2-Tan)
                    E2=(x2-width,y2+Tan)
                elif y2<y3:
                    E1=(x2+width,y2+Tan)
                    E2=(x2-width,y2-Tan)
            elif x1<x2:
                if y2>y3:
                    E1=(x2-width,y2-Tan)
                    E2=(x2+width,y2+Tan)
                elif y2<y3:
                    E1=(x2-width,y2+Tan)
                    E2=(x2+width,y2-Tan)
        elif y2==y3:
            if y1>y2:
                if x2>x3:
                    E1=(x2-Tan,y2+width)
                    E2=(x2+Tan,y2-width)
                elif x2<x3:
                    E1=(x2+Tan,y2+width)
                    E2=(x2-Tan,y2-width)
            elif y1<y2:
                if x2>x3:
                    E1=(x2-Tan,y2-width)
                    E2=(x2+Tan,y2+width)
                elif x2<x3:
                    E1=(x2+Tan,y2-width)
                    E2=(x2-Tan,y2+width)
        dxf.add_solid(	[S1,S2,E1,E2,S1])
        dxf.add_solid(	[S1,S2,E2,E1,S1])
    else:
        dxf.add_solid(	[(x1-width*degree1[1],y1+width*degree1[0]),
                        (x1+width*degree1[1],y1-width*degree1[0]),
                        (x2-width*degree1[1],y2+width*degree1[0]),
                        (x2+width*degree1[1],y2-width*degree1[0]),
                        (x1-width*degree1[1],y1+width*degree1[0])])

def draw_end(x1,y1,x2,y2,x3,y3,width,dxf):
    y1 = -y1
    y2=-y2
    y3=-y3
    position1 = []
    position2 = []
    degree1 = getdegree(x1,y1,x2,y2)
    degree2 = getdegree(x2,y2,x3,y3)
    if degree1[0] == degree2[0] and degree1[1] == degree2[1] and width==50:
        dxf.add_solid(	[(x3-width,y3),
                        (x3,y3+width),
                        (x3,y3-width),
                        (x3+width,y3)])
    if x2==x3 and y2==y3:
        return 0
    if x2==x1 and y2==y1:
        return 0
    if y2 == y3:
        degree1 = (1,0)
        degree2 = (1,0)
    elif x2 == x3:
        degree1 = (0,1)
        degree2 = (0,1)
    position_s1 = [x2-width*degree1[1],y2+width*degree1[0],inner_degree(x2-width*degree1[1],y2+width*degree1[0],(x2+x3)/2,(y2+y3)/2)]
    position_s2 = [x2+width*degree1[1],y2-width*degree1[0],inner_degree(x2-width*degree1[1],y2+width*degree1[0],(x2+x3)/2,(y2+y3)/2)]
    deg_45=0
    Tan = 82.842712/2
    if x2!=x3 and y2!=y3:
        if x2>x3:
            if y2>y3:
                deg_45=2
            elif y2<y3:
                deg_45=1
        elif x2<x3:
            if y2>y3:
                deg_45=3
            elif y2<y3:
                deg_45=4
    if deg_45!=0:
        dxf.add_solid([(x2,y2+width),(x2-width,y2),(x2+width,y2),(x2,y2-width)])
        if deg_45==1:
            if x1==x2:
                position_s1[0]=x2-width
                position_s1[1]=y2-Tan
                position_s2[0]=x2+width
                position_s2[1]=y2+Tan
            elif y1==y2:
                position_s1[0]=x2+Tan
                position_s1[1]=y2+width
                position_s2[0]=x2-Tan
                position_s2[1]=y2-width
        elif deg_45==2:
            if x1==x2:
                position_s1[0]=x2-width
                position_s1[1]=y2+Tan
                position_s2[0]=x2+width
                position_s2[1]=y2-Tan
            elif y1==y2:
                position_s1[0]=x2+Tan
                position_s1[1]=y2-width
                position_s2[0]=x2-Tan
                position_s2[1]=y2+width
        elif deg_45==3:
            if x1==x2:
                position_s1[0]=x2+width
                position_s1[1]=y2+Tan
                position_s2[0]=x2-width
                position_s2[1]=y2-Tan
            elif y1==y2:
                position_s1[0]=x2-Tan
                position_s1[1]=y2-width
                position_s2[0]=x2+Tan
                position_s2[1]=y2+width
        elif deg_45==4:
            if x1==x2:
                position_s1[0]=x2+width
                position_s1[1]=y2-Tan
                position_s2[0]=x2-width
                position_s2[1]=y2+Tan
            elif y1==y2:
                position_s1[0]=x2-Tan
                position_s1[1]=y2+width
                position_s2[0]=x2+Tan
                position_s2[1]=y2-width
    elif x1!=x2 and y1!=y2 and connect!=1 and width!=50:
        if x1>x2:
            if y1>y2:
                if y2==y3:
                    position_s1[0]=x2-Tan
                    position_s1[1]=y2+width
                    position_s2[0]=x2+Tan
                    position_s2[1]=y2-width
                elif x2==x3:
                    position_s1[0]=x2+width
                    position_s1[1]=y2-Tan
                    position_s2[0]=x2-width
                    position_s2[1]=y2+Tan
            elif y1<y2:
                if y2==y3:
                    position_s1[0]=x2-Tan
                    position_s1[1]=y2-width
                    position_s2[0]=x2+Tan
                    position_s2[1]=y2+Tan
                elif x2==x3:
                    position_s1[0]=x2+width
                    position_s1[1]=y2+Tan
                    position_s2[0]=x2-width
                    position_s2[1]=y2-Tan
        elif x1<x2:
            if y1>y2:
                if y2==y3:
                    position_s1[0]=x2+Tan
                    position_s1[1]=y2+width
                    position_s2[0]=x2-Tan
                    position_s2[1]=y2-width
                elif x2==x3:
                    position_s1[0]=x2-width
                    position_s1[1]=y2-Tan
                    position_s2[0]=x2+width
                    position_s2[1]=y2+Tan
            elif y1<y2:
                if y2==y3:
                    position_s1[0]=x2+Tan
                    position_s1[1]=y2-width
                    position_s2[0]=x2-Tan
                    position_s2[1]=y2+width
                elif x2==x3:
                    position_s1[0]=x2-width
                    position_s1[1]=y2+Tan
                    position_s2[0]=x2+width
                    position_s2[1]=y2-Tan

    if abs(position_s1[2]-position_s2[2])>90:
        if min(position_s1[2],position_s2[2]) == position_s1[2]:
            position_s2[2]-=360
        else:
            position_s1[2]-=360
    position1.append(position_s1)
    position1.append(position_s2)
    position1.sort(key=lambda k: [k[2]])
    position_e1 = [x3+width*degree2[1],y3-width*degree2[0],inner_degree(x3+width*degree2[1],y3-width*degree2[0],(x2+x3)/2,(y2+y3)/2)]
    position_e2	= [x3-width*degree2[1],y3+width*degree2[0],inner_degree(x3-width*degree2[1],y3+width*degree2[0],(x2+x3)/2,(y2+y3)/2)]
    if abs(position_e1[2]-position_e2[2])>90:
        if min(position_e1[2],position_e2[2]) == position_e1[2]:
            position_e2[2]-=360
        else:
            position_e1[2]-=360
    position2.append(position_e1)
    position2.append(position_e2)
    position2.sort(key=lambda k: [k[2]],reverse=True)
    dxf.add_solid([(position1[0][0],position1[0][1]),(position1[1][0],position1[1][1]),
                      (position2[0][0],position2[0][1]),(position2[1][0],position2[1][1])])
    dxf.add_solid([(position1[0][0],position1[0][1]),(position1[1][0],position1[1][1]),
                      (position2[1][0],position2[1][1]),(position2[0][0],position2[0][1])])
    
def draw_tmp(x1,y1,x2,y2,dxf):
    width=100
    degree1 = getdegree(x1,y1,x2,y2)
    dxf.add_solid([(x1+width*degree1[1],-y1+width*degree1[0]),(x1-width*degree1[1],-y1-width*degree1[0]),
                   (x2+width*degree1[1],-y2+width*degree1[0]),(x2-width*degree1[1],-y2-width*degree1[0])])
    

def draw_contact_pads(contactpads, dxf):
    for i in range(len(contactpads)):
        dxf.add_circle(center=(contactpads[i][0], -contactpads[i][1]), radius = 750.0)
        
def draw_electrodes(electrodes, dxf):
    for i in range(len(electrodes)):
        x = electrodes[i].real_x
        y = -electrodes[i].real_y
        type = electrodes[i].shape
        vertices = []
        for k,l in shape_scope[type]:
            #vertices.append((x+k, y+l))
            vertices.append((x+k, y-l))#mirrow
        dxf.add_polyline(vertices)
        
def draw_grid(start_x, start_y, unit_length, grids_x, grids_y,dxf):
    for i in range(grids_x):
        dxf.add_line((start_x+unit_length*i, -start_y),(start_x+unit_length*i,-(start_y+unit_length*(grids_y-1))))
    for i in range(grids_y):
        dxf.add_line((start_x, -(start_y+unit_length*i)),(start_x+unit_length*(grids_x-1),-(start_y+unit_length*i)))
        
def create_block(x, y, grids, tiles, block_shift, UNIT_LENGTH):
    for i in range(x):
        for j in range(y):
            if grids[i, j] == None:
                grids[i, j] = Grid(i*UNIT_LENGTH+block_shift[0], j*UNIT_LENGTH+block_shift[1], i, j, 0)
            if i != x-1 and j != y-1:
                tiles[i, j] = Tile()
                tiles[i, j].tile_x = i
                tiles[i, j].tile_y = j
                tiles[i, j].real_x = i*UNIT_LENGTH+block_shift[0]+UNIT_LENGTH/2
                tiles[i, j].real_y = j*UNIT_LENGTH+block_shift[1]+UNIT_LENGTH/2
                
def create_neighbor_electrodes(x,y,dir): 
    if dir[0]==1 and grids2[i-1][j-1].type>0: #012
                                              #3 4
                                              #567
        grids2[i][j].neighbor_electrode.append([grids2[i-1][j-1].electrode_index,0,-1,-1]) # index dir grids2[i-1][j-1]
    if dir[1]==1 and grids2[i][j-1].type>0:
        #avoid wire over boundary
        if grids2[i][j].real_x<electrodes[grids2[i][j-1].electrode_index].boundary_L+150 or grids2[i][j].real_x>electrodes[grids2[i][j-1].electrode_index].boundary_R-150:
            pass
        else:
            grids2[i][j].neighbor_electrode.append([grids2[i][j-1].electrode_index,1,0,-1])
    if dir[2]==1 and grids2[i+1][j-1].type>0:
        grids2[i][j].neighbor_electrode.append([grids2[i+1][j-1].electrode_index,2,1,-1])
    if dir[3]==1 and grids2[i-1][j].type>0:
        grids2[i][j].neighbor_electrode.append([grids2[i-1][j].electrode_index,3,-1,0])
    if dir[4]==1 and grids2[i+1][j].type>0:
        grids2[i][j].neighbor_electrode.append([grids2[i+1][j].electrode_index,4,1,0])
    if dir[5]==1 and grids2[i-1][j+1].type>0:
        grids2[i][j].neighbor_electrode.append([grids2[i-1][j+1].electrode_index,5,-1,1])
    if dir[6]==1 and grids2[i][j+1].type>0:
        #avoid wire over boundary
        if grids2[i][j].real_x<electrodes[grids2[i][j+1].electrode_index].boundary_L+150 or grids2[i][j].real_x>electrodes[grids2[i][j+1].electrode_index].boundary_R-150:
            pass
        else:
            grids2[i][j].neighbor_electrode.append([grids2[i][j+1].electrode_index,6,0,1])
    if dir[7]==1 and grids2[i+1][j+1].type>0:
        grids2[i][j].neighbor_electrode.append([grids2[i+1][j+1].electrode_index,7,1,1])
        
def next_electrode_index(x,y,grids,length):
    for i in range(y+1,length):
        if grids[x,i].type>0:
            return grids[x,i].electrode_index
    return -1

#create grids connection
def create_grids_connection(grids,x,y,dir):
    if dir[0]==1:
        if grids[x-1][y-1].type==0 and len(grids[x-1][y-1].neighbor_electrode)==0 and grids[x-1][y-1].safe_distance==0 and grids[x-1][y-1].safe_distance2==0 or (len(grids[x][y].neighbor_electrode)>0 and grids[x-1][y-1].safe_distance==1) or (grids[x-1][y-1].safe_distance2==1 and grids[x][y].safe_distance==1):
            grids[x][y].neighbor.append([grids[x-1][y-1], 1, Tile_Unit*math.sqrt(2)-50])
    if dir[1]==1:
        if grids[x][y-1].type==0 and len(grids[x][y-1].neighbor_electrode)==0 and grids[x][y-1].safe_distance==0 and grids[x][y-1].safe_distance2==0 or (len(grids[x][y].neighbor_electrode)>0 and grids[x][y-1].safe_distance==1) or (grids[x][y-1].safe_distance2==1 and grids[x][y].safe_distance==1):
            grids[x][y].neighbor.append([grids[x][y-1], 1, Tile_Unit-100])# max(0,Tile_Unit-grids[x][y-1].cost*500)])
    if dir[2]==1:
        if grids[x+1][y-1].type==0 and len(grids[x+1][y-1].neighbor_electrode)==0 and grids[x+1][y-1].safe_distance==0 and grids[x+1][y-1].safe_distance2==0 or (len(grids[x][y].neighbor_electrode)>0 and grids[x+1][y-1].safe_distance==1) or (grids[x+1][y-1].safe_distance2==1 and grids[x][y].safe_distance==1):
            grids[x][y].neighbor.append([grids[x+1][y-1], 1, Tile_Unit*math.sqrt(2)-50])
    if dir[3]==1:
        if grids[x-1][y].type==0 and len(grids[x-1][y].neighbor_electrode)==0 and grids[x-1][y].safe_distance==0 and grids[x-1][y].safe_distance2==0 or (len(grids[x][y].neighbor_electrode)>0 and grids[x-1][y].safe_distance==1) or (grids[x-1][y].safe_distance2==1 and grids[x][y].safe_distance==1):
            grids[x][y].neighbor.append([grids[x-1][y], 1, Tile_Unit])
    if dir[4]==1:
        if grids[x+1][y].type==0 and len(grids[x+1][y].neighbor_electrode)==0 and grids[x+1][y].safe_distance==0 and grids[x+1][y].safe_distance2==0 or (len(grids[x][y].neighbor_electrode)>0 and grids[x+1][y].safe_distance==1) or (grids[x+1][y].safe_distance2==1 and grids[x][y].safe_distance==1):
            grids[x][y].neighbor.append([grids[x+1][y], 1, Tile_Unit])
    if dir[5]==1:
        if grids[x-1][y+1].type==0 and len(grids[x-1][y+1].neighbor_electrode)==0 and grids[x-1][y+1].safe_distance==0 and grids[x-1][y+1].safe_distance2==0 or (len(grids[x][y].neighbor_electrode)>0 and grids[x-1][y+1].safe_distance==1) or (grids[x-1][y+1].safe_distance2==1 and grids[x][y].safe_distance==1):
            grids[x][y].neighbor.append([grids[x-1][y+1], 1, Tile_Unit*math.sqrt(2)-50])
    if dir[6]==1:
        if grids[x][y+1].type==0 and len(grids[x][y+1].neighbor_electrode)==0 and grids[x][y+1].safe_distance==0 and grids[x][y+1].safe_distance2==0 or (len(grids[x][y].neighbor_electrode)>0 and grids[x][y+1].safe_distance==1) or (grids[x][y+1].safe_distance2==1 and grids[x][y].safe_distance==1):
            grids[x][y].neighbor.append([grids[x][y+1], 1, Tile_Unit-100])# max(0,Tile_Unit-grids[x][y+1].cost*500)])
    if dir[7]==1:
        if grids[x+1][y+1].type==0 and len(grids[x+1][y+1].neighbor_electrode)==0 and grids[x+1][y+1].safe_distance==0  and grids[x+1][y+1].safe_distance2==0 or (len(grids[x][y].neighbor_electrode)>0 and grids[x+1][y+1].safe_distance==1) or (grids[x+1][y+1].safe_distance2==1 and grids[x][y].safe_distance==1):
            grids[x][y].neighbor.append([grids[x+1][y+1], 1, Tile_Unit*math.sqrt(2)-50])
            
def create_tiles_connection(tile_length, grids, tiles, block):
    for i in range(tile_length[0]):
        for j in range(tile_length[1]):
            # add corner
            capacity = [8,8,8,8] # u, l, d, r
            for k in (i, i+1):
                for l in (j, j+1):
                    #contact pads
                    if grids[k, l].type == -1:
                        if grids[k, l].special == False:
                            if block==1 and l==tile_length[1]:
                                pass
                            elif block==3 and l==0:
                                pass
                            else:
                                tiles[i, j].contact_pads.append(grids[k, l])
                        if k == i and l == j:
                            capacity = [2, 2, 2, 2]
                        elif k == i and l == j+1:
                            capacity[3] = 2
                        elif k == i+1 and l == j:
                            capacity[2] = 2
            if i != 0:
                tiles[i, j].neighbor.append([tiles[i-1, j], capacity[0]])#left
            if i != tile_length[0]-1:
                tiles[i, j].neighbor.append([tiles[i+1, j], capacity[2]])#right
            if j != 0:
                tiles[i, j].neighbor.append([tiles[i, j-1], capacity[1]])#top
            if j != tile_length[1]-1:
                tiles[i, j].neighbor.append([tiles[i, j+1], capacity[3]])#down
                
def create_hubs_connection(hubs, hubs_length, block2_n, tile_n, grids, tiles):
    for i in range(hubs_length):
        left = int((hubs[i].real_x-block1_shift[0])//Tile_Unit)
        right = int((hubs[i].real_x-block1_shift[0])//Tile_Unit+1)
        if i%3==0:
            if (hubs[i].real_x - grids2[left][block2_n].real_x) > (Tile_Unit/2):
                near = right
            else:
                near = left
            if grids[i//3][tile_n].special==False:
                grids2[near][block2_n].neighbor.append([hubs[i], 1, 1944])
                hubs[i].neighbor.append([grids[i//3][tile_n], 1, 1944])
        elif i%3==1:
            if (grids2[right][block2_n].real_x - hubs[i].real_x) > (250/2):
                grids2[left][block2_n].neighbor.append([hubs[i], 1, 1944])
            else:
                grids2[right][block2_n].neighbor.append([hubs[i], 1, 1944])
            hubs[i].neighbor.append([tiles[i//3][tile_n], 1, 2694])
        else:
            if (hubs[i].real_x - grids2[left][block2_n].real_x) > (250/2):
                grids2[right][block2_n].neighbor.append([hubs[i], 1, 1944])
            else:
                grids2[left][block2_n].neighbor.append([hubs[i], 1, 1944])
            hubs[i].neighbor.append([tiles[i//3][tile_n], 1, 2694])
            
def create_grid_flownode(grids_length, grids, node_index, flownodes, global_t):
    for i in range(grids_length[0]):
        for j in range(grids_length[1]):
            grids[i, j].index = node_index
            node_index += 1
            flownodes.append(grids[i, j])
            #add connect pad end node
            if grids[i, j].type == -1:
                global_t.contact_pads.append(grids[i, j])
            elif grids[i, j].type==0:
                node_index += 1
                flownodes.append(0)
    return node_index

def create_tile_flownode(tiles_length, tiles, node_index, flownodes):
    for i in range(tiles_length[0]):
        for j in range(tiles_length[1]):
            tiles[i, j].index = node_index
            node_index += 1
            flownodes.append(tiles[i, j])
            node_index += 1
            flownodes.append(0)
    return node_index


def create_hub_flownode(hubs, hubs_length, node_index, flownodes):
    for i in range(hubs_length):
        hubs[i].index = node_index
        node_index += 1
        flownodes.append(hubs[i])
    return node_index

def create_electrode_flownode(electrode,electrode_length, node_index, flownodes):
    for i in range(electrode_length):
        electrode[i].index = node_index
        node_index += 1
        flownodes.append(electrode[i])
    return node_index

def create_tiles_path(tile_length, tiles, start, end, shift, all_path):
    for i in range(tile_length[0]):
        for j in range(start,end,shift):
            for c_node in  tiles[i,j].corner_in:
                if c_node.real_x<tiles[i,j].real_x:
                    if tiles[i,j].flow[0]==1:
                        all_path.append(Path(int(hubs1[i*3+1].real_x),int(tiles[i,j].real_y),int(c_node.real_x),int(c_node.real_y)))
                        tiles[i,j].flow[0]=0
                    elif tiles[i,j].flow[1]==1:
                        all_path.append(Path(int(hubs1[i*3+2].real_x),int(tiles[i,j].real_y),int(c_node.real_x),int(c_node.real_y)))
                        tiles[i,j].flow[1]=0
                else:
                    if tiles[i,j].flow[1]==1:
                        all_path.append(Path(int(hubs1[i*3+2].real_x),int(tiles[i,j].real_y),int(c_node.real_x),int(c_node.real_y)))
                        tiles[i,j].flow[1]=0
                    elif tiles[i,j].flow[0]==1:
                        all_path.append(Path(int(hubs1[i*3+1].real_x),int(tiles[i,j].real_y),int(c_node.real_x),int(c_node.real_y)))
                        tiles[i,j].flow[0]=0
            if len(tiles[i,j].vertical_path)!=0:		
                if tiles[i,j].flow[0]==1:
                    all_path.append(Path(int(hubs1[i*3+1].real_x),int(tiles[i,j].real_y),int(hubs1[i*3+1].real_x),int(tiles[i,j].vertical_path[0].real_y)))
                    tiles[i,j].vertical_path[0].flow[0]=1
                if tiles[i,j].flow[1]==1:
                    all_path.append(Path(int(hubs1[i*3+2].real_x),int(tiles[i,j].real_y),int(hubs1[i*3+2].real_x),int(tiles[i,j].vertical_path[0].real_y)))
                    tiles[i,j].vertical_path[0].flow[1]=1
                    
                    
###start###
###init coordinate###

## real ship size
Control_pad_unit = 2540
Tile_Unit = 315 #(line width) 200 + (spacing) 115
## top down dot field dot
block1_shift = (-18000+18000%Control_pad_unit, -17745+17745%Control_pad_unit)
block2_shift = (-18000, 9258)
block3_shift = (-18000+18000%Control_pad_unit, 56896)
Grid_x = 317
Grid_y = 127
grids1_length = ((100000-18000-block1_shift[0]) // Control_pad_unit + 1, (7620-block1_shift[1]) // Control_pad_unit + 1)
grids2_length = ((100000-18000-block2_shift[0]) // Tile_Unit + 1, 46000 // Tile_Unit + 1)
grids3_length = ((100000-18000-block3_shift[0]) // Control_pad_unit + 1, (100000-17745-block3_shift[1]) // Control_pad_unit + 1)
tiles1_length = (grids1_length[0]-1, grids1_length[1]-1)
tiles2_length = (grids2_length[0]-1, grids2_length[1]-1)
tiles3_length = (grids3_length[0]-1, grids3_length[1]-1)
hubs1_length = 2*tiles1_length[0]+grids1_length[0]
hubs1_y = (block2_shift[1]+7620+750)//2
hubs3_length = 2*tiles3_length[0]+grids3_length[0]
hubs3_y = (block3_shift[1]-750 + tiles2_length[1]*Tile_Unit+block2_shift[1])//2

global  grids1
global  grids2
global  grids3
global  tiles1
global  tiles3
global  hubs1
global  hubs3

grids1 = np.empty((grids1_length[0],grids1_length[1]), dtype = Grid)
grids2 = np.empty((grids2_length[0],grids2_length[1]), dtype = Grid)
grids3 = np.empty((grids3_length[0],grids3_length[1]), dtype = Grid)
tiles1 = np.empty((tiles1_length[0],tiles1_length[1]), dtype = Tile)
tiles3 = np.empty((tiles3_length[0],tiles3_length[1]), dtype = Tile)
hubs1 = np.empty((hubs1_length), dtype = Hub)
hubs3 = np.empty((hubs3_length), dtype = Hub)
radius = 0
shape = []
shape_scope = []
electrodes = []
contactpads = []
num_electrode = 0
shape_count=0

#create grids2
for i in range (grids2_length[0]):
    for j in range(grids2_length[1]):
        grids2[i][j] = Grid(i*Tile_Unit+block2_shift[0], j*Tile_Unit+block2_shift[1], i, j, 0)
        
ewd_content = []

if _use_ewd_file == True:
    dir = os.path.join(__location__, 'TheRealChip.ewd')
    readfile = open(dir, "r")
    for index, line in enumerate(readfile):
        ewd_input+=line
        
### ewd_input string analysis ###
ewd_content = ewd_input.split('\n')
#print(ewd_input_split)

end_index = 0
for line in ewd_content:
    if line.split()[0] == "#ENDOFDEFINITION#":
        end_index = ewd_content.index(line)
        break
    elif line.split()[0] == "contactpad" and line.split()[1] == "circle":
        radius = int(line.split()[3])
    elif len(line.split()) > 1 and line.split()[1] == "path":
        shape.append(line.split()[0])
        shape_count+=1
        scope = []
        for i in range(2,len(line.split())-1,2):
            t_x=int(line.split()[i][1:])
            t_y=int(line.split()[i+1])
            scope.append((t_x,t_y))
        scope.append((int(line.split()[2][1:]),int(line.split()[3])))
        shape_scope.append(scope)

ewd_content = ewd_content[ end_index + 1 : ]

#print(ewd_content)
#print(ewd_content_head)

for line in ewd_content:
    if line.split()[0] == "#ENDOFLAYOUT#":
        break
    true_x = int(float(line.split()[1]))
    true_y = int(float(line.split()[2]))		
    if line.split()[0] == "contactpad":	
        contactpads.append((true_x,true_y))
        if true_y<=7620 :
            grid_x = (true_x - block1_shift[0]) // Control_pad_unit
            grid_y = (true_y - block1_shift[1]) // Control_pad_unit
            newgrid = Grid(true_x, true_y, grid_x, grid_y, -1)
            grids1[grid_x, grid_y] = newgrid
            if abs(true_x-(((true_x-block2_shift[0])//Tile_Unit)*Tile_Unit+block2_shift[0])) > abs(true_x-(((true_x-block2_shift[0])//Tile_Unit+1)*Tile_Unit+block2_shift[0])):
                grids1[grid_x, grid_y].real_x = (((true_x-block2_shift[0])//Tile_Unit+1)*Tile_Unit+block2_shift[0])
            else:
                grids1[grid_x, grid_y].real_x = (((true_x-block2_shift[0])//Tile_Unit)*Tile_Unit+block2_shift[0])
        else :
            grid_x = (true_x - block3_shift[0]) // Control_pad_unit
            grid_y = (true_y - block3_shift[1]) // Control_pad_unit
            newgrid = Grid(true_x, true_y, grid_x, grid_y, -1)
            grids3[grid_x, grid_y] = newgrid
            if abs(true_x-(((true_x-block2_shift[0])//Tile_Unit)*Tile_Unit+block2_shift[0])) > abs(true_x-(((true_x-block2_shift[0])//Tile_Unit+1)*Tile_Unit+block2_shift[0])):
                grids3[grid_x, grid_y].real_x = (((true_x-block2_shift[0])//Tile_Unit+1)*Tile_Unit+block2_shift[0])
            else:
                grids3[grid_x, grid_y].real_x = (((true_x-block2_shift[0])//Tile_Unit)*Tile_Unit+block2_shift[0])
    elif line.split()[0] in shape:
        for i in range (len(shape)):
            if line.split()[0] == shape[i]:
                new_electrode = Electrode(true_x,true_y,i,num_electrode)
                electrodes.append(new_electrode)
                boundary_U=true_y
                boundary_D=true_y
                boundary_L=true_x
                boundary_R=true_x
                for j in range(len(shape_scope[i])-1):
                    x1 = true_x+shape_scope[i][j][0]
                    y1 = true_y+shape_scope[i][j][1]
                    x2 = true_x+shape_scope[i][j+1][0]
                    y2 = true_y+shape_scope[i][j+1][1]
                    E_grid_x1 = (x1-block2_shift[0])//Tile_Unit
                    E_grid_x2 = (x2-block2_shift[0])//Tile_Unit
                    E_grid_y1 = (y1-block2_shift[1])//Tile_Unit
                    E_grid_y2 = (y2-block2_shift[1])//Tile_Unit
                    if x1>boundary_R:
                        boundary_R=x1
                    if x1<boundary_L:
                        boundary_L=x1
                    if y1<boundary_U:
                        boundary_U=y1
                    if y1>boundary_D:
                        boundary_D=y1
                    check_corner=0
                    if x1==x2: ## liking grid and elector
                        if y1<y2:#downward
                            E_grid_x1+=1
                            E_grid_y1+=1
                            for k in range(E_grid_y2-E_grid_y1+1):
                                grids2[E_grid_x1][E_grid_y1+k].electrode_index=num_electrode #elector into grid
                                grids2[E_grid_x1][E_grid_y1+k].type+=1
                                if (grids2[E_grid_x1][E_grid_y1-1].electrode_index==grids2[E_grid_x1][E_grid_y1].electrode_index) or k!=0:
                                    grids2[E_grid_x1][E_grid_y1+k].electrode_x = x1 
                                    grids2[E_grid_x1][E_grid_y1+k].electrode_y = grids2[E_grid_x1][E_grid_y1+k].real_y
                        else:#upward
                            E_grid_y2+=1
                            for k in range(E_grid_y1-E_grid_y2+1):
                                grids2[E_grid_x1][E_grid_y1-k].electrode_index=num_electrode
                                grids2[E_grid_x1][E_grid_y1-k].type+=1
                                if (grids2[E_grid_x1][E_grid_y1+1].electrode_index==grids2[E_grid_x1][E_grid_y1].electrode_index) or k!=0:
                                    grids2[E_grid_x1][E_grid_y1-k].electrode_x = x1 
                                    grids2[E_grid_x1][E_grid_y1-k].electrode_y = grids2[E_grid_x1][E_grid_y1-k].real_y
                    elif y1==y2:
                        if x1<x2:#----------------->
                            E_grid_x1+=1
                            for k in range(E_grid_x2-E_grid_x1+1):
                                grids2[E_grid_x1+k][E_grid_y1].electrode_index=num_electrode
                                grids2[E_grid_x1+k][E_grid_y1].type+=1
                                if (grids2[E_grid_x1-1][E_grid_y1].electrode_index==grids2[E_grid_x1][E_grid_y1].electrode_index) or k!=0:
                                    grids2[E_grid_x1+k][E_grid_y1].electrode_x = grids2[E_grid_x1+k][E_grid_y1].real_x
                                    grids2[E_grid_x1+k][E_grid_y1].electrode_y = y1
                        else:#<-----------------
                            E_grid_x2+=1
                            E_grid_y1+=1
                            for k in range(E_grid_x1-E_grid_x2+1):
                                grids2[E_grid_x1-k][E_grid_y1].electrode_index=num_electrode
                                grids2[E_grid_x1-k][E_grid_y1].type+=1
                                if (grids2[E_grid_x1+1][E_grid_y1].electrode_index==grids2[E_grid_x1][E_grid_y1].electrode_index) or k!=0:
                                    grids2[E_grid_x1-k][E_grid_y1].electrode_x = grids2[E_grid_x1-k][E_grid_y1].real_x
                                    grids2[E_grid_x1-k][E_grid_y1].electrode_y = y1
                    else:
                        if E_grid_x1!=E_grid_x2 and E_grid_y1!=E_grid_y2:
                            grids2[max(E_grid_x1,E_grid_x2),max(E_grid_y1,E_grid_y2)].electrode_index=num_electrode
                            grids2[max(E_grid_x1,E_grid_x2),max(E_grid_y1,E_grid_y2)].type+=1
                            grids2[max(E_grid_x1,E_grid_x2),max(E_grid_y1,E_grid_y2)].electrode_x = (x1+x2)/2
                            grids2[max(E_grid_x1,E_grid_x2),max(E_grid_y1,E_grid_y2)].electrode_y = (y1+y2)/2
                        else:
                            if x1>x2:
                                if y1>y2:
                                    grids2[E_grid_x1,E_grid_y2+1].electrode_x = (x1+x2)/2
                                    grids2[E_grid_x1,E_grid_y2+1].electrode_y = (y1+y2)/2
                                    grids2[E_grid_x1,E_grid_y2+1].electrode_y2 = y2
                                else:
                                    grids2[E_grid_x2+1,E_grid_y1+1].electrode_x = (x1+x2)/2
                                    grids2[E_grid_x2+1,E_grid_y1+1].electrode_y = (y1+y2)/2
                                    grids2[E_grid_x2+1,E_grid_y1+1].electrode_y2 = y1
                            else:
                                if y1<y2:
                                    grids2[E_grid_x1+1,E_grid_y2].electrode_x = (x1+x2)/2
                                    grids2[E_grid_x1+1,E_grid_y2].electrode_y = (y1+y2)/2
                                    grids2[E_grid_x1+1,E_grid_y2].electrode_y2 = y2
                                else:
                                    grids2[E_grid_x2,E_grid_y1].electrode_x = (x1+x2)/2
                                    grids2[E_grid_x2,E_grid_y1].electrode_y = (y1+y2)/2
                                    grids2[E_grid_x2,E_grid_y1].electrode_y2 = y1
                electrodes[-1].boundary_U=boundary_U
                electrodes[-1].boundary_D=boundary_D
                electrodes[-1].boundary_L=boundary_L
                electrodes[-1].boundary_R=boundary_R
        num_electrode+=1
        
create_block(grids1_length[0], grids1_length[1], grids1, tiles1, block1_shift, Control_pad_unit)
create_block(grids3_length[0], grids3_length[1], grids3, tiles3, block3_shift, Control_pad_unit)
#pogo pins
grids1[7,-1].special=True # need lock
grids1[15,-1].special=True
grids1[23,-1].special=True
grids1[31,-1].special=True
grids3[14,0].special=True
grids3[22,0].special=True
grids3[30,0].special=True
grids3[38,0].special=True

#create hub
for i in range(hubs1_length):
    if i%3==0:
        hubs1[i] = Hub(real_x=grids1[i//3,grids1_length[1]-1].real_x, real_y=hubs1_y, type=0, hub_index=i)
        hubs3[i] = Hub(real_x=grids3[i//3,0].real_x, real_y=hubs3_y, type=0, hub_index=i)
    elif i%3==1:
        thub_real_x1=block1_shift[0]+(i//3)*2540+1160+(i%3-1)*220
        thub_real_x2=block1_shift[0]+(i//3)*2540+1160+((i+1)%3-1)*220
        thub_grid_x1=(thub_real_x1-block2_shift[0])//Tile_Unit
        thub_grid_x2=(thub_real_x2-block2_shift[0])//Tile_Unit
        thub_tile_x1=(thub_real_x1-block1_shift[0])//Control_pad_unit#(thub_x1*Tile_Unit+block2_shift[0])//Control_pad_unit
        thub_tile_x2=(thub_real_x1-block1_shift[0])//Control_pad_unit+1
        #print(thub_real_x1,thub_grid_x1,thub_tile_x1)
        #print((thub_grid_x1*Tile_Unit+block2_shift[0]),(thub_tile_x1*Control_pad_unit+block1_shift[0]),abs((thub_grid_x1*Tile_Unit+block2_shift[0])-(thub_tile_x1*Control_pad_unit+block1_shift[0])))
        if thub_grid_x1!=thub_grid_x2:
            if abs((thub_grid_x1*Tile_Unit+block2_shift[0])-(thub_tile_x1*Control_pad_unit+block1_shift[0]))<950:# and abs(thub_real_x1-(thub_tile_x1*Control_pad_unit+block1_shift[0]))<abs(thub_real_x2-(thub_tile_x2*Control_pad_unit+block1_shift[0])):
                thub_grid_x1+=1
                thub_grid_x2+=1
                #dxf.add_circle(center=(thub_grid_x1*Tile_Unit+block2_shift[0], -hubs1_y), radius = 350.0)
                #dxf.add_circle(center=(thub_grid_x1*Tile_Unit+block2_shift[0], -hubs3_y), radius = 350.0)
            elif abs((thub_grid_x2*Tile_Unit+block2_shift[0])-(thub_tile_x2*Control_pad_unit+block1_shift[0]))<950:
                thub_grid_x1-=1
                thub_grid_x2-=1
        #print((thub_grid_x1*Tile_Unit+block2_shift[0]),(thub_tile_x1*Control_pad_unit+block1_shift[0]),((thub_grid_x1+1)*Tile_Unit+block2_shift[0]),((thub_tile_x1+1)*Control_pad_unit+block1_shift[0]))
        if abs((thub_grid_x1*Tile_Unit+block2_shift[0])-(thub_tile_x1*Control_pad_unit+block1_shift[0]))<1000 or abs(((thub_grid_x1+1)*Tile_Unit+block2_shift[0])-((thub_tile_x1+1)*Control_pad_unit+block1_shift[0]))<1000:
            #print(i)
            #dxf.add_circle(center=(block1_shift[0]+(i//3)*2540+1160+(i%3-1)*220, -hubs1_y), radius = 350.0)
            #dxf.add_circle(center=(block1_shift[0]+(i//3)*2540+1160+(i%3-1)*220, -hubs3_y), radius = 350.0)
            hubs1[i] = Hub(real_x=block1_shift[0]+(i//3)*2540+1160+(i%3-1)*220, real_y=hubs1_y, type=1, hub_index=i)
            hubs3[i] = Hub(real_x=block1_shift[0]+(i//3)*2540+1160+(i%3-1)*220, real_y=hubs3_y, type=1, hub_index=i)
            i+=1
            hubs1[i] = Hub(real_x=block1_shift[0]+(i//3)*2540+1160+(i%3-1)*220, real_y=hubs1_y, type=1, hub_index=i)
            hubs3[i] = Hub(real_x=block1_shift[0]+(i//3)*2540+1160+(i%3-1)*220, real_y=hubs3_y, type=1, hub_index=i)
        else:
            hubs1[i] = Hub(real_x=thub_grid_x1*Tile_Unit+block2_shift[0], real_y=hubs1_y, type=1, hub_index=i)
            hubs3[i] = Hub(real_x=thub_grid_x1*Tile_Unit+block2_shift[0], real_y=hubs3_y, type=1, hub_index=i)
            i+=1
            hubs1[i] = Hub(real_x=(thub_grid_x1+1)*Tile_Unit+block2_shift[0], real_y=hubs1_y, type=1, hub_index=i)
            hubs3[i] = Hub(real_x=(thub_grid_x1+1)*Tile_Unit+block2_shift[0], real_y=hubs3_y, type=1, hub_index=i)
            
#create electrodes neighbor
lock_index1 = -1
lock_index2 = -1

for i in range(grids2_length[0]):
    lock = False
    for j in range(grids2_length[1]):
        if lock==False and grids2[i,j].type>0 and grids2[i,j+1].type==0 and grids2[i,j-1].electrode_index!=grids2[i,j].electrode_index :
            lock = True
        elif lock==True and grids2[i,j].type>0 and grids2[i,j-1].type==0 and grids2[i,j+1].electrode_index!=grids2[i,j].electrode_index :
            lock = False
        elif lock==True and grids2[i,j].type>0 and grids2[i,j+1].type==0 and next_electrode_index(i,j,grids2,grids2_length[1])!=grids2[i,j].electrode_index :
            lock = False
        dir = [0,0,0,0,0,0,0,0]
        if grids2[i,j].type==0 and lock==False:
            #check 9 directions
            if i == 0:
                if j == 0:						# O *
                    dir = [0,0,0,0,1,0,1,1]		# * *

                elif j == grids2_length[1]-1:	# * *
                    dir = [0,1,1,0,1,0,0,0]		# O *

                else:							# * *
                    dir = [0,1,1,0,1,0,1,1]		# O *
                                                # * *
            elif i == grids2_length[0]-1:
                if j == 0:						# * O
                    dir = [0,0,0,1,0,1,1,0]		# * *

                elif j == grids2_length[1]-1:	# * *
                    dir = [1,1,0,1,0,0,0,0]		# * O	

                else:							# * *
                    dir = [1,1,0,1,0,1,1,0]		# * O
                                                # * *
            else:
                if j == 0:						# * O *
                    dir = [0,0,0,1,1,1,1,1]		# * * *

                elif j == grids2_length[1]-1:	# * * *
                    dir = [1,1,1,1,1,0,0,0]		# * O *

                else:							# * * *
                    dir = [1,1,1,1,1,1,1,1]		# * O *
                                                # * * *
            create_neighbor_electrodes(i,j,dir)
            
#draw circle

for i in range (grids2_length[0]):
    for j in range(grids2_length[1]):
        if len(grids2[i][j].neighbor_electrode)>0:
            if i!=0 and len(grids2[i-1][j].neighbor_electrode)==0:
                grids2[i-1][j].safe_distance=1
                #dxf.add_circle(center=(grids2[i-1][j].real_x, -grids2[i][j].real_y), radius = 200.0)
            if i!=grids2_length[0]-1 and len(grids2[i+1][j].neighbor_electrode)==0:
                grids2[i+1][j].safe_distance=1
                #dxf.add_circle(center=(grids2[i+1][j].real_x, -grids2[i][j].real_y), radius = 200.0)

            #dxf.add_circle(center=(grids2[i][j].real_x, -grids2[i][j].real_y), radius = 50.0)

        #if grids2[i][j].type>0:#check electrode
        #	dxf.add_circle(center=(grids2[i][j].real_x, -grids2[i][j].real_y), radius = 100.0)
        
for i in range (grids2_length[0]):
    for j in range(grids2_length[1]):
        if grids2[i][j].safe_distance==1:
            if i!=0 and len(grids2[i-1][j].neighbor_electrode)==0 and grids2[i-1][j].safe_distance==0:
                grids2[i-1][j].safe_distance2=1
                #dxf.add_circle(center=(grids2[i-1][j].real_x, -grids2[i][j].real_y), radius = 200.0)
            if i!=grids2_length[0]-1 and len(grids2[i+1][j].neighbor_electrode)==0 and grids2[i+1][j].safe_distance==0:
                grids2[i+1][j].safe_distance2=1
                #dxf.add_circle(center=(grids2[i+1][j].real_x, -grids2[i][j].real_y), radius = 200.0)
                
for i in range (grids2_length[0]):
    for j in range(grids2_length[1]):
        dir = [0,0,0,0,0,0,0,0]
        if grids2[i,j].type==0:
            #check 9 directions
            if i == 0:
                if j == 0:						# O *
                    dir = [0,0,0,0,1,0,1,1]		# * *

                elif j == grids2_length[1]-1:	# * *
                    dir = [0,1,1,0,1,0,0,0]		# O *

                else:							# * *
                    dir = [0,1,1,0,1,0,1,1]		# O *
                                                # * *
            elif i == grids2_length[0]-1:
                if j == 0:						# * O
                    dir = [0,0,0,1,0,1,1,0]		# * *

                elif j == grids2_length[1]-1:	# * *
                    dir = [1,1,0,1,0,0,0,0]		# * O	

                else:							# * *
                    dir = [1,1,0,1,0,1,1,0]		# * O
                                                # * *
            else:
                if j == 0:						# * O *
                    dir = [0,0,0,1,1,1,1,1]		# * * *

                elif j == grids2_length[1]-1:	# * * *
                    dir = [1,1,1,1,1,0,0,0]		# * O *

                else:							# * * *
                    dir = [1,1,1,1,1,1,1,1]		# * O *
                                                # * * *
            create_grids_connection(grids2,i,j,dir) 
            
create_tiles_connection(tiles1_length, grids1, tiles1, block=1)
create_tiles_connection(tiles3_length, grids3, tiles3, block=3)

create_hubs_connection(hubs1, hubs1_length, 0, -1, grids1, tiles1)
create_hubs_connection(hubs3, hubs3_length, -1, 0, grids3, tiles3)

flownodes = []
special_index = []
node_index = 0
global_t = Tile()

node_index = create_grid_flownode(grids1_length, grids1, node_index, flownodes, global_t)
node_index = create_grid_flownode(grids2_length, grids2, node_index, flownodes, global_t)
node_index = create_grid_flownode(grids3_length, grids3, node_index, flownodes, global_t)
node_index = create_tile_flownode(tiles1_length,tiles1, node_index, flownodes)
node_index = create_tile_flownode(tiles3_length,tiles3, node_index, flownodes)
node_index = create_hub_flownode(hubs1, hubs1_length, node_index, flownodes)
node_index = create_hub_flownode(hubs3, hubs3_length, node_index, flownodes)
node_index = create_electrode_flownode(electrodes, num_electrode, node_index, flownodes)

global_t.index = node_index
flownodes.append(global_t)
node_index += 1
start_nodes = []
end_nodes = []
capacities = []
unit_costs = []
supplies = [0 for i in range(len(flownodes))]
num_supply = 0
tmp_c=0

for node in flownodes:
    if type(node) == Tile and node.index != global_t.index:
        #pseudo two layer
        start_nodes.append(node.index+1)
        end_nodes.append(node.index)
        capacities.append(int(node.capacity))
        unit_costs.append(0)
        # add neighbor tiles
        for nb_node in node.neighbor:
            start_nodes.append(node.index)
            end_nodes.append(nb_node[0].index+1)
            capacities.append(int(nb_node[1]))
            unit_costs.append(int(Control_pad_unit))
        # add contact pads
        for cp_node in node.contact_pads:
            start_nodes.append(node.index)
            end_nodes.append(cp_node.index)
            capacities.append(1)
            unit_costs.append(1)
        supplies[node.index] = 0
    elif type(node) == Tile and node.index==global_t.index:
        for cp_node in node.contact_pads:
            start_nodes.append(cp_node.index)
            end_nodes.append(node.index)
            capacities.append(1)
            unit_costs.append(-1)
        supplies[node.index] = 0
    elif type(node) == Grid:
        if node.type==0:
            start_nodes.append(node.index+1)
            end_nodes.append(node.index)
            capacities.append(1)
            unit_costs.append(0)
            for nb_node in node.neighbor:
                start_nodes.append(node.index)
                if type(nb_node[0])==Grid:
                    end_nodes.append(nb_node[0].index+1)
                else:
                    end_nodes.append(nb_node[0].index)
                capacities.append(int(nb_node[1]))
                unit_costs.append(int(nb_node[2]))
        if len(node.neighbor_electrode) > 0:
            for ne_node in node.neighbor_electrode:
                start_nodes.append(electrodes[ne_node[0]].index)
                end_nodes.append(node.index+1)
                capacities.append(1)
                if ne_node[1]==1 or ne_node[1]==6:
                    unit_costs.append(0)
                else:
                    unit_costs.append(200)
        supplies[node.index] = 0	
    elif type(node) == Hub:
        for nb_node in node.neighbor:
            start_nodes.append(node.index)
            end_nodes.append(nb_node[0].index)
            capacities.append(int(nb_node[1]))
            unit_costs.append(int(nb_node[2]))
        supplies[node.index] = 0
    elif type(node) == Electrode:
        supplies[node.index] = 1
        num_supply+=1
        
supplies[global_t.index] = -num_supply

### ortool
from ortools.graph import pywrapgraph
min_cost_flow = pywrapgraph.SimpleMinCostFlow()
# print("start min_cost_flow")

# Add each arc.
for i in range(0, len(start_nodes)):
    min_cost_flow.AddArcWithCapacityAndUnitCost(start_nodes[i], end_nodes[i],
                                                capacities[i], unit_costs[i])
# print("Add each arc")

# Add node supplies.
sum = 0
for i in range(0, len(supplies)):
    min_cost_flow.SetNodeSupply(i, supplies[i])
    sum += supplies[i]
# print("Add node supplies")

MaxFlowWithMinCost = min_cost_flow.SolveMaxFlowWithMinCost()

#Find the minimum cost flow between node 0 and node 4.
all_path = []
electrode_wire=[[] for _ in range(num_electrode)]
if MaxFlowWithMinCost == min_cost_flow.OPTIMAL and len(electrode_wire) > 0:
#     print('Minimum cost:', min_cost_flow.OptimalCost())	
    for i in range(min_cost_flow.NumArcs()):
        if min_cost_flow.Flow(i) != 0:
            head = min_cost_flow.Tail(i)
            tail = min_cost_flow.Head(i)
            if flownodes[head] == 0:
                pass
            if flownodes[tail] == 0:
                tail -= 1

            if type(flownodes[head]) == Electrode and type(flownodes[tail]) == Grid:
                index_list = []
                tmp_x = flownodes[tail].grid_x
                tmp_y = flownodes[tail].grid_y
                for en_node in flownodes[tail].neighbor_electrode:
                    if en_node[0] == flownodes[head].electrode_index:
                        index_list.append([en_node[1],en_node[2],en_node[3]])
                if len(index_list)==1: ## only belong to ONE Electrode
                    E_x = grids2[tmp_x+index_list[0][1],tmp_y+index_list[0][2]].electrode_x
                    E_y = grids2[tmp_x+index_list[0][1],tmp_y+index_list[0][2]].electrode_y
                    Shift_x = E_x - grids2[tmp_x+index_list[0][1],tmp_y+index_list[0][2]].real_x
                    Shift_y = E_y - grids2[tmp_x+index_list[0][1],tmp_y+index_list[0][2]].real_y
                    #all_path.append(Path(int(grids2[tmp_x+index_list[0][1],tmp_y+index_list[0][2]].real_x),int(grids2[tmp_x+index_list[0][1],tmp_y+index_list[0][2]].real_y),int(flownodes[tail].real_x),int(flownodes[tail].real_y)))
                    all_path.append(Path(int(E_x),int(E_y),int(flownodes[tail].real_x+Shift_x),int(flownodes[tail].real_y+Shift_y)))
                    all_path.append(Path(int(flownodes[tail].real_x+Shift_x),int(flownodes[tail].real_y+Shift_y),int(flownodes[tail].real_x),int(flownodes[tail].real_y)))
                else:
                    for nb_list in index_list:
                        if nb_list[0] == 1 or nb_list[0] == 6: ## dir of electrode left-top & right-top only have ONE E
                            if grids2[tmp_x+nb_list[1],tmp_y+nb_list[2]].electrode_y2!=0:
                                grids2[tmp_x+nb_list[1],tmp_y+nb_list[2]].electrode_y=grids2[tmp_x+nb_list[1],tmp_y+nb_list[2]].electrode_y2
                            all_path.append(Path(int(grids2[tmp_x+nb_list[1],tmp_y+nb_list[2]].real_x),int(grids2[tmp_x+nb_list[1],tmp_y+nb_list[2]].electrode_y),int(flownodes[tail].real_x),int(flownodes[tail].real_y)))
                        if nb_list[0] == 3 or nb_list[0] == 4:
                            all_path.append(Path(int(grids2[tmp_x+nb_list[1],tmp_y+nb_list[2]].electrode_x),int(grids2[tmp_x+nb_list[1],tmp_y+nb_list[2]].electrode_y),int(flownodes[tail].real_x),int(flownodes[tail].real_y)))
            elif type(flownodes[head]) == Grid and type(flownodes[tail]) == Grid:
                all_path.append(Path(int(flownodes[head].real_x),int(flownodes[head].real_y),int(flownodes[tail].real_x),int(flownodes[tail].real_y)))
                flownodes[head].flow=1
                flownodes[tail].flow=1
            elif type(flownodes[head]) == Grid and type(flownodes[tail]) == Hub:
                all_path.append(Path(int(flownodes[head].real_x),int(flownodes[head].real_y),int(flownodes[tail].real_x),int(flownodes[tail].real_y)))
            elif type(flownodes[head]) == Hub and type(flownodes[tail]) == Grid:
                all_path.append(Path(int(flownodes[head].real_x),int(flownodes[head].real_y),int(flownodes[tail].real_x),int(flownodes[tail].real_y)))
            elif type(flownodes[head]) == Hub and type(flownodes[tail]) == Tile:
                all_path.append(Path(int(flownodes[head].real_x),int(flownodes[head].real_y),int(flownodes[head].real_x),int(flownodes[tail].real_y)))
                if flownodes[head].hub_index%3 == 1:
                    flownodes[tail].flow[0]=1
                elif flownodes[head].hub_index%3 == 2:
                    flownodes[tail].flow[1]=1
            elif type(flownodes[head]) == Tile and type(flownodes[tail]) == Tile:
                flownodes[head].total_flow+=min_cost_flow.Flow(i)
                if flownodes[head].tile_x == flownodes[tail].tile_x:
                    flownodes[head].vertical_path.append(flownodes[tail])
                elif flownodes[head].tile_y == flownodes[tail].tile_y:
                    flownodes[head].horizontal_path.append(flownodes[tail])
            elif type(flownodes[head]) == Tile and type(flownodes[tail]) == Grid:
                flownodes[head].corner_in.append(flownodes[tail])
    
if MaxFlowWithMinCost == min_cost_flow.OPTIMAL and len(electrode_wire) > 0:
    create_tiles_path(tiles1_length,tiles1,tiles1_length[1]-1,-1,-1,all_path)
    create_tiles_path(tiles3_length,tiles3,0,tiles1_length[1],1,all_path)
#     print("all_path = ",len(all_path))

if MaxFlowWithMinCost == min_cost_flow.OPTIMAL and len(electrode_wire) > 0:
    for i in range(len(all_path)):
        for j in range(len(all_path)):
            if all_path[j].start_x == all_path[i].end_x and all_path[j].start_y == all_path[i].end_y:
                all_path[i].next = all_path[j]
                all_path[j].head = 0 ## 0 or 1 
                break

#     print("---------------------------------")

if MaxFlowWithMinCost == min_cost_flow.OPTIMAL and len(electrode_wire) > 0:
    j=0

    for i in range(len(all_path)):
        if all_path[i].head == 1:
            #print(all_path[i].start_x,all_path[i].start_y,all_path[i].end_x,all_path[i].end_y)
            #dxf.add_circle(center=(all_path[i].start_x, -all_path[i].start_y), radius = 750.0)
            electrode_wire[j].append(all_path[i])
            tmp_next = all_path[i].next
            while tmp_next != None:
                #print(tmp_next.start_x,tmp_next.start_y,tmp_next.end_x,tmp_next.end_y)
                if tmp_next.start_x==tmp_next.end_x and tmp_next.start_y==tmp_next.end_y:
                    break
                electrode_wire[j].append(tmp_next)
                tmp_next = tmp_next.next
            j+=1
            
if MaxFlowWithMinCost == min_cost_flow.OPTIMAL and len(electrode_wire) > 0:
    draw_second = 0

    electrode_wire[0].clear()
    electrode_wire[0].append(Path(start_x=-4835,start_y=13889,end_x=0,end_y=13889))
    electrode_wire[0].append(Path(start_x=0,start_y=13889,end_x=0,end_y=7620))
    
def draw_all_path(electrode_wire, dxf, grids2):
    if MaxFlowWithMinCost == min_cost_flow.OPTIMAL:
        connect = 0
        for i in range(len(electrode_wire)):
            #tune path start 
            ## reduce change way
            if abs(electrode_wire[i][0].start_x-electrode_wire[i][0].end_x)!=0 and abs(electrode_wire[i][0].start_y-electrode_wire[i][0].end_y)!=0 and (np.sign(electrode_wire[i][0].start_x-electrode_wire[i][0].end_x)!=np.sign(electrode_wire[i][1].start_x-electrode_wire[i][1].end_x)) and (electrode_wire[i][2].start_x==electrode_wire[i][2].end_x):
                electrode_wire[i][0].end_x = electrode_wire[i][1].end_x
                electrode_wire[i][0].end_y = electrode_wire[i][0].start_y+abs(electrode_wire[i][2].start_x-electrode_wire[i][0].start_x)*np.sign(electrode_wire[i][2].start_y-electrode_wire[i][0].start_y)
                electrode_wire[i][2].start_y=electrode_wire[i][0].start_y+abs(electrode_wire[i][2].start_x-electrode_wire[i][0].start_x)*np.sign(electrode_wire[i][2].start_y-electrode_wire[i][0].start_y)
                del electrode_wire[i][1]

            if abs(electrode_wire[i][1].start_x-electrode_wire[i][1].end_x)!=abs(electrode_wire[i][1].start_y-electrode_wire[i][1].end_y) and abs(electrode_wire[i][1].start_x-electrode_wire[i][1].end_x)!=0 and abs(electrode_wire[i][1].start_y-electrode_wire[i][1].end_y)!=0:
                if abs(electrode_wire[i][2].end_x-electrode_wire[i][1].start_x)>abs(electrode_wire[i][2].end_y-electrode_wire[i][1].start_y):
                    electrode_wire[i][1].end_x = electrode_wire[i][1].start_x+abs(electrode_wire[i][2].end_y-electrode_wire[i][1].start_y)*np.sign(electrode_wire[i][2].end_x-electrode_wire[i][1].start_x)
                    electrode_wire[i][1].end_y = electrode_wire[i][2].end_y
                    electrode_wire[i][2].start_x = electrode_wire[i][1].start_x+abs(electrode_wire[i][2].end_y-electrode_wire[i][1].start_y)*np.sign(electrode_wire[i][2].end_x-electrode_wire[i][1].start_x)
                    electrode_wire[i][2].start_y = electrode_wire[i][2].end_y
                else:
                    electrode_wire[i][1].end_x = electrode_wire[i][2].end_x
                    electrode_wire[i][1].end_y = electrode_wire[i][1].start_y+abs(electrode_wire[i][2].end_x-electrode_wire[i][1].start_x)*np.sign(electrode_wire[i][2].end_y-electrode_wire[i][1].start_y)
                    electrode_wire[i][2].start_x = electrode_wire[i][2].end_x
                    electrode_wire[i][2].start_y = electrode_wire[i][1].start_y+abs(electrode_wire[i][2].end_x-electrode_wire[i][1].start_x)*np.sign(electrode_wire[i][2].end_y-electrode_wire[i][1].start_y)

            for j in range(len(electrode_wire[i])-2):
                if np.sign(electrode_wire[i][j].start_x-electrode_wire[i][j].end_x)!=np.sign(electrode_wire[i][j+1].start_x-electrode_wire[i][j+1].end_x) and (electrode_wire[i][j].start_x-electrode_wire[i][j].end_x)!=0:
                    if abs(electrode_wire[i][j+1].end_x-electrode_wire[i][j].start_x)>abs(electrode_wire[i][j+1].end_y-electrode_wire[i][j].start_y):
                        electrode_wire[i][j].end_x = electrode_wire[i][j].start_x+abs(electrode_wire[i][j+1].end_y-electrode_wire[i][j].start_y)*np.sign(electrode_wire[i][j+1].end_x-electrode_wire[i][j].start_x)
                        electrode_wire[i][j].end_y = electrode_wire[i][j+1].end_y
                        electrode_wire[i][j+1].start_x = electrode_wire[i][j].start_x+abs(electrode_wire[i][j+1].end_y-electrode_wire[i][j].start_y)*np.sign(electrode_wire[i][j+1].end_x-electrode_wire[i][j].start_x)
                        electrode_wire[i][j+1].start_y = electrode_wire[i][j+1].end_y
                    else:
                        electrode_wire[i][j].end_x = electrode_wire[i][j+1].end_x
                        electrode_wire[i][j].end_y = electrode_wire[i][j].start_y+abs(electrode_wire[i][j+1].end_x-electrode_wire[i][j].start_x)*np.sign(electrode_wire[i][j+1].end_y-electrode_wire[i][j].start_y)
                        electrode_wire[i][j+1].start_x = electrode_wire[i][j+1].end_x
                        electrode_wire[i][j+1].start_y = electrode_wire[i][j].start_y+abs(electrode_wire[i][j+1].end_x-electrode_wire[i][j].start_x)*np.sign(electrode_wire[i][j+1].end_y-electrode_wire[i][j].start_y)

            for j in range(len(electrode_wire[i])-2):	
                if abs(electrode_wire[i][j].start_x-electrode_wire[i][j].end_x) == 0 and abs(electrode_wire[i][j+1].start_y-electrode_wire[i][j+1].end_y) == 0:
                    electrode_wire[i][j].end_x = electrode_wire[i][j].start_x+abs(electrode_wire[i][j].end_y-electrode_wire[i][j].start_y)*np.sign(electrode_wire[i][j+1].end_x-electrode_wire[i][j+1].start_x)
                    electrode_wire[i][j+1].start_x = electrode_wire[i][j].end_x
                if abs(electrode_wire[i][j].start_y-electrode_wire[i][j].end_y) == 0 and abs(electrode_wire[i][j+1].start_x-electrode_wire[i][j+1].end_x) == 0:
                    electrode_wire[i][j].end_y = electrode_wire[i][j].start_y+abs(electrode_wire[i][j].end_x-electrode_wire[i][j].start_x)*np.sign(electrode_wire[i][j+1].end_y-electrode_wire[i][j+1].start_y)
                    electrode_wire[i][j+1].start_y = electrode_wire[i][j].end_y

            for j in range(len(electrode_wire[i])):
                if (electrode_wire[i][j].start_x-electrode_wire[i][j].end_x)==0 and abs(electrode_wire[i][j].start_y-electrode_wire[i][j].end_y)==250:
                    #dxf.add_circle(center=(electrode_wire[i][j].start_x, -electrode_wire[i][j].start_y), radius = 250.0)
                    if np.sign(electrode_wire[i][j-1].start_x-electrode_wire[i][j-1].end_x)*np.sign(electrode_wire[i][j+1].start_x-electrode_wire[i][j+1].end_x)==-1:
                        #dxf.add_circle(center=(electrode_wire[i][j].start_x, -electrode_wire[i][j].start_y), radius = 250.0)
                        electrode_wire[i][j-1].end_y = electrode_wire[i][j].start_y+abs(electrode_wire[i][j+1].end_x-electrode_wire[i][j].start_x)*np.sign(electrode_wire[i][j].start_y-electrode_wire[i][j].end_y)
                        electrode_wire[i][j].start_y = electrode_wire[i][j-1].end_y
                        electrode_wire[i][j-1].end_x = electrode_wire[i][j+1].end_x
                        electrode_wire[i][j].start_x = electrode_wire[i][j+1].end_x
                        electrode_wire[i][j].end_x = electrode_wire[i][j+1].end_x
                        electrode_wire[i][j+1].start_x = electrode_wire[i][j+1].end_x
                    if electrode_wire[i][j-1].start_x!=electrode_wire[i][j-1].end_x and electrode_wire[i][j+1].start_x!=electrode_wire[i][j+1].end_x:
                        #dxf.add_circle(center=(electrode_wire[i][j].start_x, -electrode_wire[i][j].start_y), radius = 250.0)
                        electrode_wire[i][j-1].end_x = electrode_wire[i][j+1].end_x
                        electrode_wire[i][j-1].end_y = electrode_wire[i][j-1].end_y+abs(electrode_wire[i][j+1].end_x-electrode_wire[i][j+1].start_x)*np.sign(electrode_wire[i][j+1].end_y-electrode_wire[i][j+1].start_y)
                        electrode_wire[i][j].start_x = electrode_wire[i][j-1].end_x
                        electrode_wire[i][j].start_y = electrode_wire[i][j-1].end_y
                        electrode_wire[i][j].end_x = electrode_wire[i][j+1].end_x
                        electrode_wire[i][j+1].start_x = electrode_wire[i][j+1].end_x

                if electrode_wire[i][j].end_y > block2_shift[1] and electrode_wire[i][j].end_y < block2_shift[1]+46000:
                    S_grid_x = (electrode_wire[i][j].start_x-block2_shift[0])//Tile_Unit
                    S_grid_y = (electrode_wire[i][j].start_y-block2_shift[1])//Tile_Unit
                    T_grid_x = (electrode_wire[i][j].end_x-block2_shift[0])//Tile_Unit
                    T_grid_y = (electrode_wire[i][j].end_y-block2_shift[1])//Tile_Unit
                    grids2[S_grid_x,S_grid_y].flow=1
                    grids2[T_grid_x,T_grid_y].flow=1

            #|      |    j-1        |       \   j+1
            #\  ->  |    j     or   \  ->    |  j
            # |      \   j+1         |       |  j-1

            for j in range(3,len(electrode_wire[i])):		
                if electrode_wire[i][j].end_y > block2_shift[1]+Tile_Unit and electrode_wire[i][j].end_y < block2_shift[1]+46000-Tile_Unit:
                    if electrode_wire[i][j-1].start_x==electrode_wire[i][j-1].end_x and abs(electrode_wire[i][j].start_x-electrode_wire[i][j].end_x)==abs(electrode_wire[i][j].start_y-electrode_wire[i][j].end_y):
                        check_grid_x = (electrode_wire[i][j].start_x-block2_shift[0])//Tile_Unit
                        check_grid_y = (electrode_wire[i][j].end_y-block2_shift[1])//Tile_Unit
                        if grids2[check_grid_x,check_grid_y].flow == 0 and grids2[check_grid_x,check_grid_y].safe_distance==0 and grids2[check_grid_x,check_grid_y].safe_distance2==0:
                            k=1
                            no_path=0
                            while electrode_wire[i][j+k].start_x!=electrode_wire[i][j+k].end_x:
                                check_grid_x = (electrode_wire[i][j+k].start_x-block2_shift[0])//Tile_Unit
                                check_grid_y = (electrode_wire[i][j+k].end_y-block2_shift[1])//Tile_Unit
                                if grids2[check_grid_x,check_grid_y].flow != 0:# or grids2[check_grid_x,check_grid_y].safe_distance2==1 or grids2[check_grid_x,check_grid_y].safe_distance==1:
                                    no_path=1
                                if electrode_wire[i][j+k].start_y < block2_shift[1]+Tile_Unit*2 or electrode_wire[i][j+k].start_y > block2_shift[1]+46000-Tile_Unit*2:
                                    no_path=1
                                k+=1
                            if no_path==0:
                                #check_grid_flow=0
                                grids2[check_grid_x,check_grid_y].flow=1
                                grids2[check_grid_x+np.sign(electrode_wire[i][j].end_x-electrode_wire[i][j].start_x),check_grid_y].flow=0
                                electrode_wire[i][j].end_x = electrode_wire[i][j].start_x
                                k=1
                                while electrode_wire[i][j+k].start_x!=electrode_wire[i][j+k].end_x:# and check_grid_flow==0:
                                    check_grid_x = (electrode_wire[i][j+k].start_x-block2_shift[0])//Tile_Unit
                                    check_grid_y = (electrode_wire[i][j+k].end_y-block2_shift[1])//Tile_Unit	
                                    grids2[check_grid_x,check_grid_y].flow=1
                                    grids2[check_grid_x+np.sign(electrode_wire[i][j+k].end_x-electrode_wire[i][j+k].start_x),check_grid_y].flow=0
                                    electrode_wire[i][j+k].end_x = electrode_wire[i][j+k].start_x
                                    electrode_wire[i][j+k].start_x = electrode_wire[i][j+k-1].end_x	
                                    k+=1
                                    if (j+k)>=(len(electrode_wire[i])-1):
                                        break
                                    if electrode_wire[i][j+k].start_y < block2_shift[1]+Tile_Unit*2 or electrode_wire[i][j+k].start_y > block2_shift[1]+46000-Tile_Unit*2:
                                        break
                                electrode_wire[i][j+k].start_x = electrode_wire[i][j+k-1].end_x	

            #|     |    j+1           | 	 |
            #\  -> |    j      or     /  ->  |
            # |     \   j-1          | 		/

            for j in range(len(electrode_wire[i])):
                if (electrode_wire[i][j].start_x-electrode_wire[i][j].end_x)==0 and abs(electrode_wire[i][j].start_y-electrode_wire[i][j].end_y)==250:
                    if electrode_wire[i][j-1].start_x!=electrode_wire[i][j-1].end_x and electrode_wire[i][j+1].start_x!=electrode_wire[i][j+1].end_x and np.sign(electrode_wire[i][j-1].end_x-electrode_wire[i][j-1].start_x)==np.sign(electrode_wire[i][j+1].end_x-electrode_wire[i][j+1].start_x):
                        if grids2[(((electrode_wire[i][j].start_x-block2_shift[0])//Tile_Unit)+np.sign(electrode_wire[i][j-1].end_x-electrode_wire[i][j-1].start_x)), ((electrode_wire[i][j].start_y-block2_shift[1])//Tile_Unit)].flow==0:
                            #dxf.add_circle(center=(electrode_wire[i][j].start_x, -electrode_wire[i][j].start_y), radius = 250.0)
                            electrode_wire[i][j-1].end_x = electrode_wire[i][j+1].end_x
                            electrode_wire[i][j-1].end_y = electrode_wire[i][j-1].end_y+abs(electrode_wire[i][j+1].end_x-electrode_wire[i][j+1].start_x)*np.sign(electrode_wire[i][j+1].end_y-electrode_wire[i][j+1].start_y)
                            electrode_wire[i][j].start_x = electrode_wire[i][j-1].end_x
                            electrode_wire[i][j].start_y = electrode_wire[i][j-1].end_y
                            electrode_wire[i][j].end_x = electrode_wire[i][j+1].end_x
                            electrode_wire[i][j+1].start_x = electrode_wire[i][j+1].end_x

            for j in range(len(electrode_wire[i])-1):
                if (electrode_wire[i][j].start_x-electrode_wire[i][j].end_x)==0 and abs(electrode_wire[i][j].start_y-electrode_wire[i][j].end_y)==250:
                    #dxf.add_circle(center=(electrode_wire[i][j].start_x, -electrode_wire[i][j].start_y), radius = 250.0)
                    if np.sign(electrode_wire[i][j-1].start_x-electrode_wire[i][j-1].end_x)*np.sign(electrode_wire[i][j+1].start_x-electrode_wire[i][j+1].end_x)==-1:
                        #dxf.add_circle(center=(electrode_wire[i][j].start_x, -electrode_wire[i][j].start_y), radius = 250.0)
                        electrode_wire[i][j-1].end_y = electrode_wire[i][j].start_y+abs(electrode_wire[i][j+1].end_x-electrode_wire[i][j].start_x)*np.sign(electrode_wire[i][j].start_y-electrode_wire[i][j].end_y)
                        electrode_wire[i][j].start_y = electrode_wire[i][j-1].end_y
                        electrode_wire[i][j-1].end_x = electrode_wire[i][j+1].end_x
                        electrode_wire[i][j].start_x = electrode_wire[i][j+1].end_x
                        electrode_wire[i][j].end_x = electrode_wire[i][j+1].end_x
                        electrode_wire[i][j+1].start_x = electrode_wire[i][j+1].end_x
                elif (electrode_wire[i][j].start_x-electrode_wire[i][j].end_x)!=0 and np.sign(electrode_wire[i][j].start_x-electrode_wire[i][j].end_x)*np.sign(electrode_wire[i][j+1].start_x-electrode_wire[i][j+1].end_x)==-1:
                    electrode_wire[i][j].end_x = electrode_wire[i][j].start_x
                    electrode_wire[i][j+1].start_x = electrode_wire[i][j].end_x

            if electrode_wire[i][-1].start_x!=electrode_wire[i][-1].end_x:
                electrode_wire[i][-1].start_y = electrode_wire[i][-1].end_y+np.sign(electrode_wire[i][-1].start_y-electrode_wire[i][-1].end_y)*abs(electrode_wire[i][-1].start_x-electrode_wire[i][-1].end_x)
                electrode_wire[i][-2].end_y = electrode_wire[i][-1].start_y

            for j in range(len(electrode_wire[i])-1):
                if (electrode_wire[i][j].start_x-electrode_wire[i][j].end_x)!=0 and (electrode_wire[i][j].start_y-electrode_wire[i][j].end_y)!=0 and abs(electrode_wire[i][j].start_x-electrode_wire[i][j].end_x)!=abs(electrode_wire[i][j].start_y-electrode_wire[i][j].end_y):
                    #dxf.add_circle(center=(electrode_wire[i][j].start_x, -electrode_wire[i][j].start_y), radius = 250.0)
                    electrode_wire[i][j].end_y = electrode_wire[i][j].start_y+np.sign(electrode_wire[i][j].end_y-electrode_wire[i][j].start_y)*abs(electrode_wire[i][j+1].start_x-electrode_wire[i][j].start_x)
                    electrode_wire[i][j+1].start_y = electrode_wire[i][j].end_y
            #draw path
            for j in range(len(electrode_wire[i])):
                if j == 0:
                    if i==0:
                        draw_start(electrode_wire[i][j].start_x,electrode_wire[i][j].start_y,electrode_wire[i][j].end_x,electrode_wire[i][j].end_y,electrode_wire[i][j+1].end_x,electrode_wire[i][j+1].end_y,200, dxf)
                        dxf.add_solid(	[(electrode_wire[i][j].end_x-200,-(electrode_wire[i][j].end_y-200)),
                            (electrode_wire[i][j].end_x-200,-(electrode_wire[i][j].end_y+200)),
                            (electrode_wire[i][j].end_x+200,-(electrode_wire[i][j].end_y-200)),
                            (electrode_wire[i][j].end_x+200,-(electrode_wire[i][j].end_y+200))])
                    else:
                        draw_start(electrode_wire[i][j].start_x,electrode_wire[i][j].start_y,electrode_wire[i][j].end_x,electrode_wire[i][j].end_y,electrode_wire[i][j+1].end_x,electrode_wire[i][j+1].end_y,50, dxf)
                    draw_second=1
                elif j == len(electrode_wire[i])-1:
                    if i==0:
                        draw_end(electrode_wire[i][j-1].start_x,electrode_wire[i][j-1].start_y,
                              electrode_wire[i][j].start_x,electrode_wire[i][j].start_y,
                              electrode_wire[i][j].end_x,electrode_wire[i][j].end_y,200,dxf)
                    else:
                        draw_end(electrode_wire[i][j-1].start_x,electrode_wire[i][j-1].start_y,
                              electrode_wire[i][j].start_x,electrode_wire[i][j].start_y,
                              electrode_wire[i][j].end_x,electrode_wire[i][j].end_y,100,dxf)
                elif draw_second==1:
                    if i==0:
                        draw_path(electrode_wire[i][j-1].start_x,electrode_wire[i][j-1].start_y,
                            electrode_wire[i][j].start_x,electrode_wire[i][j].start_y,
                            electrode_wire[i][j].end_x,electrode_wire[i][j].end_y,
                            electrode_wire[i][j+1].end_x,electrode_wire[i][j+1].end_y,200,connect,dxf)

                    else:
                        draw_path(electrode_wire[i][j-1].start_x,electrode_wire[i][j-1].start_y,
                            electrode_wire[i][j].start_x,electrode_wire[i][j].start_y,
                            electrode_wire[i][j].end_x,electrode_wire[i][j].end_y,
                            electrode_wire[i][j+1].end_x,electrode_wire[i][j+1].end_y,50,connect,dxf)
                    draw_second=0
                    connect=1
                else:
                    if i==0:
                        draw_path(electrode_wire[i][j-1].start_x,electrode_wire[i][j-1].start_y,
                              electrode_wire[i][j].start_x,electrode_wire[i][j].start_y,
                              electrode_wire[i][j].end_x,electrode_wire[i][j].end_y,
                              electrode_wire[i][j+1].end_x,electrode_wire[i][j+1].end_y,200,connect,dxf)
                    else:
                        draw_path(electrode_wire[i][j-1].start_x,electrode_wire[i][j-1].start_y,
                              electrode_wire[i][j].start_x,electrode_wire[i][j].start_y,
                              electrode_wire[i][j].end_x,electrode_wire[i][j].end_y,
                              electrode_wire[i][j+1].end_x,electrode_wire[i][j+1].end_y,100,connect,dxf)
                        
with r12writer(ewd_name + '.dwg') as dxf:
    draw_contact_pads(contactpads, dxf)
    draw_electrodes(electrodes, dxf)
    draw_all_path(electrode_wire, dxf, grids2)
    
response = ''
with open(ewd_name + '.dwg') as f:
    for line in f.readlines():
        response = response + line
        
print(response)
    
    
## show grid text view

# draw_grid(block1_shift[0], block1_shift[1], Control_pad_unit, grids1_length[0], grids1_length[1])
# draw_grid(block2_shift[0], block2_shift[1], Tile_Unit, grids2_length[0], grids2_length[1])
# draw_grid(block3_shift[0], block3_shift[1], Control_pad_unit, grids3_length[0], grids3_length[1])
